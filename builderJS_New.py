#!/usr/bin/env python3
import re
from pathlib import Path
from jsmin import jsmin
from datetime import datetime

# =========================
# KONFIGURACJA
# =========================
SRC_CONFIG = Path("./src/config")
SRC_CLASS  = Path("./src/class")
STATIC_DATA = Path("./static/data")
DOCS_PAGES  = Path("./documentation/Pages")

MINIFY = False
GENERATE_DOCS_MD = True

# Wymuszeni liderzy kolejności (jeśli istnieją):
FORCE_FIRST = ["Diagnostics"]

# Opcjonalne aliasy: jeśli plik nazywa się inaczej niż globalny symbol (rzadkie przypadki)
ALIASES = {
    # "SomeFileStem": "ActualGlobalName"
}

# =========================
# POMOCNICZE
# =========================

def read_file(p: Path) -> str:
    return p.read_text(encoding="utf-8") if p.exists() else ""

def get_providers_and_extends():
    """
    Buduje mapę dostawców symboli na podstawie plików .js:
    - providers: {SymbolName: Path} — SymbolName to stem pliku lub alias
    - extends_map: {ClassName: BaseName} tylko dla plików z klasą i extends
    Uwaga: nie wymagamy 'class X' aby włączyć plik do providers — to naprawia przypadek Utils, Logger, itp.
    """
    providers = {}
    extends_map = {}

    for f in SRC_CLASS.glob("*.js"):
        stem = f.stem
        symbol = ALIASES.get(stem, stem)
        providers[symbol] = f

        code = read_file(f)
        # Jeśli jest klasa i extends — zapisz do extends_map, żeby można było posortować
        m = re.search(rf"\bclass\s+{re.escape(symbol)}\s+extends\s+([A-Z]\w+)", code)
        if m:
            extends_map[symbol] = m.group(1)

    return providers, extends_map

def find_used_symbols(code: str, available_symbols: set[str]) -> set[str]:
    """
    Szuka użyć globalnych symboli: bierzemy wszystkie tokeny PascalCase/UpperCamelCase
    i filtrujemy do znanych symboli (nazw plików/aliasów).
    """
    tokens = set(re.findall(r"\b([A-Z][A-Za-z0-9_]*)\b", code))
    return tokens & available_symbols

def resolve_all_dependencies(seed_symbols, providers, extends_map):
    """
    Głęboka (do punktu stałego) analiza zależności:
    - rekurencyjnie skanuje kody już znalezionych symboli,
    - dodaje nowe symbole, jeśli są użyte,
    - dba o bazę z 'extends' (jeśli występuje).
    """
    available_symbols = set(providers.keys())
    needed = set(seed_symbols)

    # Punkt stały: dopóki przybywa nowych symboli — skanuj dalej
    while True:
        size_before = len(needed)

        for sym in list(needed):
            code = read_file(providers[sym])
            refs = find_used_symbols(code, available_symbols)

            # Dodaj bazę z 'extends' (tylko jeśli ten plik faktycznie definiuje klasę z extends)
            base = extends_map.get(sym)
            if base and base in available_symbols:
                refs.add(base)

            needed |= refs

        if len(needed) == size_before:
            break

    # Topologiczne sortowanie po extends tam gdzie ma sens
    indeg = {s: 0 for s in needed}
    graph = {s: [] for s in needed}
    for s in needed:
        base = extends_map.get(s)
        if base and base in needed:
            indeg[s] += 1
            graph[base].append(s)

    queue = [s for s, d in indeg.items() if d == 0]
    ordered = []
    while queue:
        node = queue.pop(0)
        ordered.append(node)
        for nxt in graph[node]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                queue.append(nxt)

    # Liderzy na początek (Diagnostics itd.)
    leaders = [s for s in FORCE_FIRST if s in ordered]
    for s in leaders:
        ordered.remove(s)
    ordered = leaders + ordered

    return ordered

def generate_docs(symbol, code):
    md_lines = []
    lines = code.splitlines()

    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("/**"):
            # 1) Zbierz blok JSDoc (bez linii '*/')
            doc_block = []
            j = i + 1
            while j < len(lines) and "*/" not in lines[j]:
                doc_block.append(lines[j])
                j += 1
            # pomijamy j (linia z '*/')
            # 2) Oczyść gwiazdki
            doc_text = "\n".join(doc_block)
            doc_text = re.sub(r"^\s*\*\s?", "", doc_text, flags=re.MULTILINE).strip()

            # 3) Znajdź następną niepustą linię po JSDoc
            k = j + 1
            while k < len(lines) and not lines[k].strip():
                k += 1
            signature_line = lines[k].strip() if k < len(lines) else ""

            # 4) Rozpoznaj element i generuj markdown
            if signature_line.startswith("class "):
                # Opis klasy
                cleaned = _cleanup_class_doc(symbol, doc_text)
                md_lines.append(f"# {symbol}\n")
                md_lines.append(cleaned)
                md_lines.append("\n---\n")

            elif signature_line.startswith("constructor"):
                sig, body = extract_block(lines, k)
                md_lines.append(f"## constructor\n")
                md_lines.extend(format_jsdoc_block(doc_text))
                md_lines.append("```javascript")
                md_lines.append(body)
                md_lines.append("```")
                md_lines.append("\n---\n")

            elif re.match(r"^[A-Za-z0-9_]+\s*\(", signature_line) or re.match(r"^[A-Za-z0-9_]+\s*=\s*\(", signature_line):
                sig, body = extract_block(lines, k)
                method_name = re.split(r"\(", sig, 1)[0].strip()
                md_lines.append(f"## {method_name}()\n")
                md_lines.extend(format_jsdoc_block(doc_text))
                md_lines.append("```javascript")
                md_lines.append(body)
                md_lines.append("```")
                md_lines.append("\n---\n")

            i = j + 1
        else:
            i += 1

    (DOCS_PAGES / f"{symbol}.md").write_text("\n".join(md_lines), encoding="utf-8")


def extract_block(lines, start_index):
    """
    Zwraca (signature, full_block_text) dla konstruktora/metody.
    signature: tekst od linii startowej do '{' (bez '{')
    full_block_text: od deklaracji (z zachowaniem tej linii) aż do domknięcia klamer
    """
    # Zbierz do pierwszej klamry '{'
    sig_parts = []
    first_brace_line = None
    for idx in range(start_index, len(lines)):
        sig_parts.append(lines[idx])
        if "{" in lines[idx]:
            first_brace_line = idx
            break
    raw_sig = " ".join(sig_parts)
    signature = raw_sig.split("{", 1)[0].strip()

    # Teraz policz klamry od pierwszej '{' do zera
    brace_count = 0
    block_lines = []
    for idx in range(start_index, len(lines)):
        line = lines[idx]
        # liczymy klamry prosto (bez analizy stringów) – w praktyce wystarcza
        brace_count += line.count("{")
        block_lines.append(line)
        brace_count -= line.count("}")
        if brace_count == 0 and idx >= first_brace_line:
            break

    # Złóż pełny blok z oryginalnym formatowaniem
    full_block_text = "\n".join(block_lines).rstrip()
    return signature, full_block_text


def format_jsdoc_block(doc_text):
    """
    Formatuje opis + parametry + returns zgodnie z wymaganym stylem:
    - **_@param_** *`{type}`* _**name**_
    - **@returns** *`{type}`*
    + pusta linia po sekcji parametrów
    """
    out = []
    params = []
    returns = None
    desc_lines = []

    for raw in doc_text.split("\n"):
        line = raw.strip()
        if line.startswith("@param"):
            # @param {type} name - desc (desc opcjonalny)
            m = re.match(r"@param\s+\{(.+?)\}\s+([\w<>]+)(?:\s*-\s*(.*))?$", line)
            if m:
                ptype, pname, pdesc = m.groups()
                typed = f"**_@param_** *`{{{ptype}}}`* _**{pname}**_"
                if pdesc:
                    params.append(f"{typed}  {pdesc}")
                else:
                    params.append(f"{typed}  ")
            else:
                # niech wpadnie do opisu, jeśli format jest nietypowy
                desc_lines.append(raw)
        elif line.startswith("@returns"):
            m = re.match(r"@returns\s+\{(.+?)\}\s*(.*)$", line)
            if m:
                rtype, rdesc = m.groups()
                typed = f"**@returns** *`{{{rtype}}}`*"
                returns = f"{typed}  {rdesc}".rstrip()
            else:
                desc_lines.append(raw)
        else:
            # Zamień np. <main id="app"> na `...` dla lepszej czytelności
            safe = re.sub(r"<([^>]+)>", r"`<\1>`", raw)
            desc_lines.append(safe)

    if desc_lines:
        out.append("\n".join(desc_lines).strip())
        out.append("")

    if params:
        out.extend(params)
        out.append("")  # pusta linia po ostatnim parametrze

    if returns:
        out.append(returns)
        out.append("")

    return out


def _cleanup_class_doc(symbol, doc_text):
    """
    Usuwa z opisu klasy ewentualny duplikat tytułu typu 'Dom' i dekoracyjne '==='/'---'.
    Konwertuje <tagi> na kod inline.
    """
    lines = [re.sub(r"<([^>]+)>", r"`<\1>`", l) for l in doc_text.split("\n")]
    cleaned = []
    skip_next_decoration = False

    for idx, l in enumerate(lines):
        if idx == 0 and l.strip() == symbol:
            skip_next_decoration = True
            continue
        if skip_next_decoration and l.strip() in ("===", "---"):
            skip_next_decoration = False
            continue
        cleaned.append(l)

    return "\n".join(cleaned).strip()




def update_copilot_files(symbols):
    nav = []
    idx = []
    for s in sorted(symbols):
        nav.append(f"# {s}: https://chatrpai.github.io/documentation/Pages/{s}.md")
        idx.append(f"# {s}")
    (DOCS_PAGES / "copilot_navigate.md").write_text("\n".join(nav), encoding="utf-8")
    (DOCS_PAGES / "_index.md").write_text("\n".join(idx), encoding="utf-8")

# =========================
# BUDOWANIE
# =========================

def build_bundle_for_init(init_file: Path):
    providers, extends_map = get_providers_and_extends()
    available_symbols = set(providers.keys())

    init_code = read_file(init_file)
    seed = find_used_symbols(init_code, available_symbols)

    # Jeśli Context występuje w init — dołóż (czasem przekazywany jako symbol)
    if "Context" in available_symbols and re.search(r"\bContext\b", init_code):
        seed.add("Context")

    ordered = resolve_all_dependencies(seed, providers, extends_map)

    print(f"[INFO] init: {init_file.name} → użyte symbole: {len(ordered)}")
    merged = ""

    for sym in ordered:
        print(f"[ADD] {sym}")
        merged += read_file(providers[sym]) + "\n"

    # init zawsze po klasach/modułach
    merged += init_code + "\n"

    # DiagnosticsTests.js z ./src/class na sam koniec (gdy nie minifikujemy)
    if not MINIFY:
        diag_tests = SRC_CLASS / "DiagnosticsTests.js"
        if diag_tests.exists():
            print("[ADD] DiagnosticsTests.js (tail)")
            merged += read_file(diag_tests) + "\n"

    if MINIFY:
        merged = jsmin(merged)

    STATIC_DATA.mkdir(parents=True, exist_ok=True)
    out_name = init_file.stem.replace("init_", "") + ".js"
    (STATIC_DATA / out_name).write_text(merged, encoding="utf-8")
    print(f"[OK] Wygenerowano: {out_name}")

    if GENERATE_DOCS_MD:
        DOCS_PAGES.mkdir(parents=True, exist_ok=True)
        for sym in ordered:
            generate_docs(sym, read_file(providers[sym]))
        update_copilot_files(ordered)

def build_all():
    for init_file in SRC_CONFIG.glob("init_*.js"):
        build_bundle_for_init(init_file)

if __name__ == "__main__":
    print(f"[INFO] Start builderJS.py {datetime.now()}")
    build_all()
    print(f"[INFO] Zakończono {datetime.now()}")

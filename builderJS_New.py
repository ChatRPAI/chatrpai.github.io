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


# =========================
# DOKUMENTACJA
# =========================

def generate_docs(symbol, code):
    md = []
    lines = code.splitlines()

    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith("/**"):
            block = []
            j = i + 1
            while j < len(lines) and "*/" not in lines[j]:
                block.append(lines[j])
                j += 1

            doc_lines = []
            for raw in block:
                if raw.strip() in ("/", "*"):
                    continue
                cleaned = re.sub(r"^\s*\*\s?", "", raw.rstrip())
                doc_lines.append(cleaned)
            doc_text = "\n".join(doc_lines)

            k = j + 1
            while k < len(lines) and not lines[k].strip():
                k += 1
            decl = lines[k].strip() if k < len(lines) else ""

            # Obsługa pola instancji: /** @type {...} */ + this.nazwa = ...
            if decl.startswith("this.") and "@type" in doc_text:
                field_line = lines[k].rstrip()
                desc_lines = []
                tag_lines = []
                for l in doc_text.split("\n"):
                    if l.strip().startswith("@"):
                        tag_lines.append(l)
                    else:
                        desc_lines.append(l)
                for line in desc_lines:
                    md.append(_inline_sanitize(line))
                md.append("")
                md.extend(format_jsdoc_block("\n".join(tag_lines)))
                md.append("```javascript")
                md.append(field_line)
                md.append("```")
                md.append("")
                md.append("---")
                md.append("")
                i = j + 1
                continue

            if decl.startswith("class "):
                md.append(f"# {symbol}")
                md.append("")
                md.extend(_cleanup_class_doc(symbol, doc_text))
                md.append("")
                md.append("---")
                md.append("")
            else:
                kind, name, sig, body = match_declaration_and_extract(lines, k)

                if kind in ("ctor", "method"):
                    md.append(f"## {name}()" if kind == "method" else "## constructor")
                    md.append("")
                    md.extend(format_jsdoc_block(doc_text))
                    md.append("```javascript")
                    md.append(body)
                    md.append("```")
                    md.append("")
                    md.append("---")
                    md.append("")

                elif kind in ("field", "instance"):
                    desc_lines = []
                    tag_lines = []
                    for l in doc_text.split("\n"):
                        if l.strip().startswith("@"):
                            tag_lines.append(l)
                        else:
                            desc_lines.append(l)
                    for line in desc_lines:
                        md.append(_inline_sanitize(line))
                    md.append("")
                    md.extend(format_jsdoc_block("\n".join(tag_lines)))
                    md.append("```javascript")
                    md.append(body)
                    md.append("```")
                    md.append("")
                    md.append("---")
                    md.append("")

                else:
                    for line in doc_text.split("\n"):
                        md.append(_inline_sanitize(line))
                    md.append("")
                    md.append("---")
                    md.append("")

            i = j + 1
        else:
            i += 1

    # Dodaj pełny kod klasy bez komentarzy
    stripped = []
    for line in lines:
        if line.strip().startswith("//"):
            continue
        if line.strip().startswith("/*") or line.strip().startswith("*") or line.strip().startswith("/**"):
            continue
        if "*/" in line:
            continue
        stripped.append(line)
    md.append("## Pełny kod klasy")
    md.append("")
    md.append("```javascript")
    md.extend(stripped)
    md.append("```")

    (DOCS_PAGES / f"{symbol}.md").write_text("\n".join(md), encoding="utf-8")



def match_declaration_and_extract(lines, start_idx):
    if start_idx >= len(lines):
        return ("unknown", "", "", "")

    probe = ""
    end_idx = start_idx
    while end_idx < len(lines):
        probe += lines[end_idx].strip() + " "
        if "{" in lines[end_idx] or ";" in lines[end_idx] or "=" in lines[end_idx]:
            break
        end_idx += 1

    probe_compact = probe.strip()

    if re.match(r"^(?:async\s+)?constructor\s*\(", probe_compact):
        sig, body = extract_block(lines, start_idx)
        return ("ctor", "constructor", sig, body)

    m = re.match(r"^(?:async\s+|static\s+|get\s+|set\s+)*\s*(#?[A-Za-z_]\w*)\s*\(", probe_compact)
    if m:
        name = m.group(1)
        sig, body = extract_block(lines, start_idx)
        return ("method", name, sig, body)

    m = re.match(r"^(?:async\s+|static\s+)*\s*(#?[A-Za-z_]\w*)\s*=\s*\(.*?\)\s*=>", probe_compact)
    if m:
        name = m.group(1)
        sig, body = extract_block(lines, start_idx)
        return ("method", name, sig, body)

    m = re.match(r"^(?:static\s+)?(#?[A-Za-z_]\w*)\s*=", probe_compact)
    if m:
        name = m.group(1)
        field_line = lines[start_idx].rstrip()
        return ("field", name, name, field_line)

    return ("unknown", "", "", "")


def extract_block(lines, start_index):
    sig_parts = []
    first_brace_line = None
    for idx in range(start_index, len(lines)):
        sig_parts.append(lines[idx])
        if "{" in lines[idx]:
            first_brace_line = idx
            break
    raw_sig = " ".join(sig_parts)
    signature = raw_sig.split("{", 1)[0].strip()

    brace_count = 0
    block = []
    for idx in range(start_index, len(lines)):
        line = lines[idx]
        brace_count += line.count("{")
        block.append(line)
        brace_count -= line.count("}")
        if brace_count == 0 and (first_brace_line is not None) and idx >= first_brace_line:
            break

    full = "\n".join(block).rstrip()
    return signature, full


def format_jsdoc_block(doc_text):
    out = []
    params = []
    returns = None
    type_line = None
    desc = []

    for raw in doc_text.split("\n"):
        line = raw.strip()
        if line.startswith("@param"):
            m = re.match(r"@param\s+\{(.+?)\}\s+([\w<>]+)(?:\s*-\s*(.*))?$", line)
            if m:
                ptype, pname, pdesc = m.groups()
                head = f"**_@param_** *`{{{ptype}}}`* _**{pname}**_"
                params.append(f"{head}  {pdesc or ''}".rstrip())
            else:
                desc.append(_inline_sanitize(raw))
        elif line.startswith("@returns"):
            m = re.match(r"@returns\s+\{(.+?)\}\s*(.*)$", line)
            if m:
                rtype, rdesc = m.groups()
                returns = f"**@returns** *`{{{rtype}}}`*  {rdesc}".rstrip()
            else:
                desc.append(_inline_sanitize(raw))
        elif line.startswith("@type"):
            m = re.match(r"@type\s+\{(.+?)\}", line)
            if m:
                ttype = m.group(1)
                type_line = f"**@type** *`{{{ttype}}}`*"
            else:
                desc.append(_inline_sanitize(raw))
        else:
            desc.append(_inline_sanitize(raw))

    if desc:
        for line in desc:
            out.append(line.rstrip())
        out.append("")  # pusta linia po opisie
    if params:
        for p in params:
            out.append(p)
            out.append("")
    if returns:
        out.append(returns)
        out.append("")
    if type_line:
        out.append(type_line)
        out.append("")

    return out


def _inline_sanitize(text):
    return re.sub(r"<([^>]+)>", r"`<\1>`", text)


def _cleanup_class_doc(symbol, doc_text):
    lines = doc_text.split("\n")
    cleaned = []
    skip_title = False

    for idx, line in enumerate(lines):
        raw = line.rstrip()
        if idx == 0 and raw.strip() == symbol:
            skip_title = True
            continue
        if skip_title and raw.strip() in ("===", "---"):
            skip_title = False
            continue
        cleaned.append(_inline_sanitize(raw))

    # Zwróć jako lista linii, nie jako jeden string
    return cleaned



# ========================
# DOKUMENTACJA
# ========================

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

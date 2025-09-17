import os
import re
import time
from rjsmin import jsmin

SRC_CLASS_DIR = "src/class/"
SRC_CONFIG_DIR = "src/config/"
DOC_DIR = "src/tmp/"
OUTPUT_DIR = "static/data/"

MINIFY = False
GENERATE_DOCS = False
last_modified = {}

# --- I/O ---
def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# --- Bundle ---
def get_output_filename():
    for fname in os.listdir(SRC_CONFIG_DIR):
        if fname.startswith("init_") and fname.endswith(".js"):
            return fname.replace("init_", "")
    raise FileNotFoundError("Brak pliku init_*.js w src/config/")

def build_bundle():
    files = [f for f in os.listdir(SRC_CLASS_DIR) if f.endswith(".js")]
    diagnostics_test_file = None

    if "DiagnosticsTests.js" in files:
        files.remove("DiagnosticsTests.js")
        diagnostics_test_file = "DiagnosticsTests.js"

    ordered = []
    for special in ["LoggerService.js", "Diagnostics.js"]:
        if special in files:
            ordered.append(special)
            files.remove(special)

    files.sort()
    final_order = ordered + files

    parts = []
    for fname in final_order:
        parts.append(f"// 📦 {fname}\n{read_file(os.path.join(SRC_CLASS_DIR, fname))}\n")

    # Dodawanie pliku init_
    init_name = get_output_filename().strip()
    parts.append(f"// 🚀 init_{init_name}\n{read_file(os.path.join(SRC_CONFIG_DIR, f'init_{init_name}'))}\n")

    # Dodawanie DiagnosticsTests.js na samym końcu, po pliku init_
    if diagnostics_test_file:
        parts.append(f"// 📦 {diagnostics_test_file}\n{read_file(os.path.join(SRC_CLASS_DIR, diagnostics_test_file))}\n")

    bundle = "\n".join(parts)
    if MINIFY:
        bundle = jsmin(bundle)

    out_path = os.path.join(OUTPUT_DIR, init_name)
    write_file(out_path, bundle)
    print(f"📦 Zapisano scalony plik: {out_path}")

# --- Parsery JSDoc ---
def clean_jsdoc_block(block):
    lines = block.strip().splitlines()
    return "\n".join(line.strip().lstrip("*").strip() for line in lines if line.strip())

def parse_jsdoc(doc):
    lines = doc.splitlines()
    summary, params, returns = [], [], None
    for line in lines:
        if line.startswith("@param"):
            m = re.match(r"@param\s+\{(.+?)\}\s+(\w+)\s*-\s*(.*)", line)
            if m:
                params.append((m.group(2), m.group(1), m.group(3)))
        elif line.startswith("@returns") or line.startswith("@return"):
            m = re.match(r"@returns?\s+\{(.+?)\}\s*-\s*(.*)", line)
            if m:
                returns = (m.group(1), m.group(2))
        elif not line.startswith("@"):
            summary.append(line)
    return {"summary": "\n".join(summary).strip(), "params": params, "returns": returns}

def extract_class_name_from_code(code):
    m = re.search(r"\bclass\s+(\w+)\b", code)
    return m.group(1) if m else None

def extract_class_jsdoc(code, class_name):
    m = re.search(r"/\*\*([\s\S]*?)\*/\s*class\s+" + re.escape(class_name) + r"\b", code)
    return clean_jsdoc_block(m.group(1)) if m else ""

def extract_constructor_block(code):
    # Znajdź pozycję konstruktora
    ctor_match = re.search(r"constructor\s*\((.*?)\)\s*{", code)
    if not ctor_match:
        return "", "", ""
    args = ctor_match.group(1).strip()
    start = ctor_match.start()
    # Szukaj najbliższego powyżej komentarza JSDoc
    jsdoc = ""
    jsdoc_blocks = list(re.finditer(r"/\*\*([\s\S]*?)\*/", code[:start], re.MULTILINE))
    if jsdoc_blocks:
        jsdoc = code[jsdoc_blocks[-1].start():jsdoc_blocks[-1].end()]
    # Parsuj nawiasy klamrowe, ignorując komentarze i stringi
    start_brace = code.find('{', ctor_match.end()-1)
    depth = 0
    end = start_brace
    in_single = in_double = in_backtick = False
    in_line_comment = in_block_comment = False
    while end < len(code):
        c = code[end]
        c_next = code[end+1] if end+1 < len(code) else ''
        if in_line_comment:
            if c == '\n':
                in_line_comment = False
        elif in_block_comment:
            if c == '*' and c_next == '/':
                in_block_comment = False
                end += 1
        elif in_single:
            if c == '\\':
                end += 1  # skip escaped char
            elif c == "'":
                in_single = False
        elif in_double:
            if c == '\\':
                end += 1
            elif c == '"':
                in_double = False
        elif in_backtick:
            if c == '\\':
                end += 1
            elif c == '`':
                in_backtick = False
        else:
            if c == '/' and c_next == '/':
                in_line_comment = True
                end += 1
            elif c == '/' and c_next == '*':
                in_block_comment = True
                end += 1
            elif c == "'":
                in_single = True
            elif c == '"':
                in_double = True
            elif c == '`':
                in_backtick = True
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    break
        end += 1
    body = code[start_brace+1:end] if depth == 0 else ""
    return args, body.strip(), jsdoc.strip()

def extract_fields_from_constructor(code):
    fields = []
    ctor_match = re.search(r"constructor\s*\(.*?\)\s*{([\s\S]*?)}", code)
    if not ctor_match:
        return fields
    ctor_body = ctor_match.group(1)
    field_pattern = re.compile(r"/\*\*([\s\S]*?)\*/\s*this\.(\w+)\s*=")
    for m in field_pattern.finditer(ctor_body):
        jsdoc = clean_jsdoc_block(m.group(1))
        tmatch = re.search(r"@type\s+\{(.+?)\}\s*(.*)", jsdoc)
        if tmatch:
            fields.append((m.group(2), tmatch.group(1).strip(), tmatch.group(2).strip()))
        else:
            fields.append((m.group(2), "unknown", jsdoc))
    return fields

def extract_methods(code):
    methods = []
    # Ogranicz parsowanie tylko do wnętrza klasy (ignoruj komentarze/nagłówki przed class ...)
    class_match = re.search(r'class\s+\w+\s*{([\s\S]*)}$', code, re.MULTILINE)
    class_body = class_match.group(1) if class_match else code
    # Zabezpieczenie: wycinaj tylko czysty JSDoc bez kodu, nie łap fragmentów kodu po */
    pattern = re.compile(
        r"/\*\*([\s\S]*?)\*/\s*(?:(async)\s+)?(?:(static)\s+)?(?:(get|set)\s+)?(\w+)\s*\((.*?)\)\s*{",
        re.MULTILINE
    )
    for m in pattern.finditer(class_body):
        doc_raw, _, is_static, acc, name, args = m.groups()
        if name == "constructor":
            continue
        # Odetnij wszystko po pierwszym wystąpieniu '*/' w doc_raw (jeśli parser źle złapał)
        doc_clean = clean_jsdoc_block(doc_raw.split('*/')[0] if '*/' in doc_raw else doc_raw)
        # Jeśli doc_clean zawiera wiele linii z this.coś =, to jest to fragment z konstruktora, pomiń
        if re.search(r"^\s*this\.\w+\s*=", doc_clean, re.MULTILINE):
            continue
        doc = parse_jsdoc(doc_clean)
        kind = "method"
        if acc == "get":
            kind = "getter"
        elif acc == "set":
            kind = "setter"
        elif is_static:
            kind = "static"
        methods.append({"name": name, "args": args.strip(), "jsdoc": doc, "kind": kind})
    return methods

def find_dependencies_filtered(code, project_class_names):
    tokens = set(re.findall(r"\b([A-Z][A-Za-z0-9_]+)\b", code))
    blacklist = {"JSON", "Date", "Promise", "HTMLElement", "Map", "Set", "Error", "Object", "RegExp", "Math"}
    return sorted([t for t in tokens if t not in blacklist and t in project_class_names])

# --- Generowanie dokumentacji ---
def generate_doc_for_class(code, project_class_names):
    class_name = extract_class_name_from_code(code)
    if not class_name:
        return None, None
    lines = [f"# 📦 {class_name}\n"]
    class_doc = extract_class_jsdoc(code, class_name)
    if class_doc:
        lines.append(class_doc + "\n")

    args, body, ctor_jsdoc = extract_constructor_block(code)
    # Dodaj sekcję konstruktora tylko jeśli istnieje kod konstruktora (nie pusty, nie tylko "constructor() {}")
    if body and (body.strip() or args.strip()):
        lines.append("---\n## 🧬 Konstruktor\n")
        if ctor_jsdoc:
            # Zamień blok JSDoc na czysty opis i listę parametrów, usuń /** i / z początku/końca
            doc_lines = []
            for line in clean_jsdoc_block(ctor_jsdoc).splitlines():
                l = line.strip()
                if l in ("/**", "/"):  # pomiń linie komentarza blokowego
                    continue
                m = re.match(r'@param\s*\{([^}]+)\}\s*(\w+)\s*-\s*(.*)', l)
                if m:
                    doc_lines.append(f"⚙️ *@param {{{m.group(1)}}}* - {m.group(3)}")
                elif l.startswith('@param'):
                    doc_lines.append(f"⚙️ *{l}*")
                elif l and not l.startswith('@'):
                    doc_lines.append(l)
            if doc_lines:
                lines.append("\n".join(doc_lines) + "\n")
    lines.append(f"```js\nconstructor({args}) {{\n{body}\n}}\n```")

    fields = extract_fields_from_constructor(code)
    if fields:
        lines.append("\n---\n## 🧬 Pola klasowe\n")
        for name, ftype, fdesc in fields:
            lines.append(f"- `{name}` (`{ftype}`): {fdesc}")

    methods = extract_methods(code)
    if methods:
        lines.append("\n---\n## 🔧 Metody\n")
        for m in methods:
            # Pomijaj metody, które są powielonymi fragmentami konstruktora
            if m['name'] == 'constructor':
                continue
            # Pomijaj metody, których summary powiela nagłówek klasy lub JSDoc klasy
            method_summary = m["jsdoc"]["summary"].strip() if m["jsdoc"]["summary"] else ""
            if method_summary and (method_summary == class_doc.strip() or method_summary.startswith(class_name)):
                method_summary = ""
            lines.append(f"### `{m['name']}({m['args']})`\n")
            if method_summary:
                lines.append(method_summary + "\n")
            if m["jsdoc"]["params"]:
                lines.append("**Parametry:**")
                for pname, ptype, pdesc in m["jsdoc"]["params"]:
                    lines.append(f"- `{pname}` (`{ptype}`): {pdesc}")
            if m["jsdoc"]["returns"]:
                rtype, rdesc = m["jsdoc"]["returns"]
                lines.append(f"**Zwraca:** `{rtype}` – {rdesc}")
            lines.append("")

    deps = find_dependencies_filtered(code, project_class_names)
    if deps:
        lines.append("---\n## 🔗 Zależności\n")
        for d in deps:
            lines.append(f"- `{d}`")

    return class_name, "\n".join(lines)

def build_docs():
    if not GENERATE_DOCS:
        return
    os.makedirs(DOC_DIR, exist_ok=True)

    class_sources = {}
    project_class_names = set()
    for fname in os.listdir(SRC_CLASS_DIR):
        if fname.endswith(".js"):
            code = read_file(os.path.join(SRC_CLASS_DIR, fname))
            cname = extract_class_name_from_code(code)
            if cname:
                class_sources[cname] = code
                project_class_names.add(cname)

    # Generuj .md dla każdej klasy
    generated_class_names = set()
    for cname, code in class_sources.items():
        _, md = generate_doc_for_class(code, project_class_names)
        if md:
            write_file(os.path.join(DOC_DIR, f"{cname}.md"), md)
            generated_class_names.add(cname)

    # Dodaj dokumentację modułów startowych init_*.js
    for fname in os.listdir(SRC_CONFIG_DIR):
        if fname.startswith("init_") and fname.endswith(".js"):
            name = fname.replace("init_", "").replace(".js", "")
            code = read_file(os.path.join(SRC_CONFIG_DIR, fname))
            # Wyszukaj wszystkie klasy w pliku startowym
            class_blocks = re.findall(r'(\/\*\*[\s\S]*?\*\/\s*class\s+[A-Z][A-Za-z0-9_]+[\s\S]*?\n})', code)
            class_docs = []
            for block in class_blocks:
                cname = extract_class_name_from_code(block)
                # Pomijaj klasy, które już zostały wygenerowane z src/class
                if cname and cname not in generated_class_names:
                    doc_name, doc_md = generate_doc_for_class(block, set())
                    if doc_md:
                        class_docs.append(doc_md)
                        generated_class_names.add(cname)
            # Wyodrębnij fragmenty globalne (kod poza klasami)
            # Usuwamy wszystkie klasy z kodu, zostawiamy tylko fragmenty globalne
            code_no_classes = code
            for block in class_blocks:
                code_no_classes = code_no_classes.replace(block, "")
            # Zostaw tylko niepuste linie, które nie są komentarzami JSDoc ani pustymi
            global_lines = []
            for line in code_no_classes.splitlines():
                l = line.strip()
                if l and not l.startswith("/**") and not l.startswith("*/") and not l.startswith("*"):
                    global_lines.append(line)
            global_code = "\n".join(global_lines).strip()
            # Jeśli znaleziono klasy, dołącz je do dokumentacji modułu
            if class_docs:
                lines = [f"# 🚀 Moduł startowy: `{name}`\n"]
                lines.extend(class_docs)
                if global_code:
                    lines.append("```js")
                    lines.append(global_code)
                    lines.append("```")
                write_file(os.path.join(DOC_DIR, f"init_{name}.md"), "\n\n".join(lines))
            else:
                lines = [f"# 🚀 Moduł startowy: `{name}`\n", "```js", global_code, "```"]
                write_file(os.path.join(DOC_DIR, f"init_{name}.md"), "\n".join(lines))

    # Scal dokumenty w jeden plik
    all_docs = []
    for fname in sorted(os.listdir(DOC_DIR)):
        if fname.endswith(".md") and fname != "dokumentacja.md":
            content = read_file(os.path.join(DOC_DIR, fname)).strip()
            all_docs.append(content)
    # Nadpisz plik dokumentacja.md nową zawartością
    write_file(os.path.join(DOC_DIR, "dokumentacja.md"), "\n\n---\n\n".join(all_docs))
    print("📚 Scalono dokumentację do src/tmp/dokumentacja.md")

# --- Orkiestracja ---
def build_all():
    print("🔄 Aktualizacja...")
    build_bundle()
    if GENERATE_DOCS:
        build_docs()

def monitor_changes():
    print("👀 Obserwuję zmiany w:", SRC_CLASS_DIR, SRC_CONFIG_DIR)
    while True:
        changed = False
        for folder in [SRC_CLASS_DIR, SRC_CONFIG_DIR]:
            for fname in os.listdir(folder):
                if not fname.endswith(".js"):
                    continue
                path = os.path.join(folder, fname)
                mtime = os.path.getmtime(path)
                if path not in last_modified or last_modified[path] != mtime:
                    last_modified[path] = mtime
                    changed = True
        if changed:
            try:
                build_all()
            except Exception as e:
                print(f"❌ Błąd podczas budowania: {e}")
        time.sleep(0.5)

if __name__ == "__main__":
    os.makedirs(DOC_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    monitor_changes()

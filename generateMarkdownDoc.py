import os

TMP_DIR = "static/data/tmp/"
OUTPUT_FILE = "project-doc.md"

def collect_markdown_files():
    files = []
    for filename in sorted(os.listdir(TMP_DIR)):
        if filename.endswith(".md"):
            path = os.path.join(TMP_DIR, filename)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                files.append((filename.replace(".md", ""), content))
    return files

def generate_project_doc():
    print("🧩 Generuję dokumentację projektu...")

    sections = []
    sections.append("# 📘 Dokumentacja projektu\n")
    sections.append("Ten plik zawiera pełną dokumentację klas JavaScript wygenerowaną automatycznie na podstawie kodu źródłowego.\n")
    sections.append("Zadawaj mi pytania dotyczące projektu. Jak np.: `Czy możesz mi podać kod klasy/metody xyz?` Tak aby refaktoryzacja była łatwiejsza i lepsza.\n\n---\n")

    for class_name, content in collect_markdown_files():
        sections.append(f"## 📦 {class_name}\n")
        sections.append(content)
        sections.append("\n---\n")

    with open("rozwój.md", "r", encoding="utf-8") as roz_file:
        sections.append(roz_file.read())

    with open("./static/data/script_pre_refactor.js", "r", encoding="utf-8") as pre_refactor_file:
        sections.append("## 🛠️ Kod przed refaktoryzacją\n")
        sections.append("```js")
        sections.append(pre_refactor_file.read())
        sections.append("```\n")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(sections))

    print(f"✅ Zapisano dokumentację do: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_project_doc()

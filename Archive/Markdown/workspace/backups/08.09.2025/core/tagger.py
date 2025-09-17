import json
import os

class TagEngine:
    def __init__(self, tag_file="tags.json"):
        self.rules = {}
        if os.path.exists(tag_file):
            with open(tag_file, "r", encoding="utf-8") as f:
                self.rules = json.load(f)

    def extract_tags(self, text: str) -> list:
        text = text.lower()
        tags = set()
        for tag, stems in self.rules.items():
            for stem in stems:
                if stem in text:
                    tags.add(tag)
                    break
        return list(tags)

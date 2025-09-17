```character.py
import json

class Character:
    def __init__(self, name, race, role, style, tone, emotions, backstory="", relationships=None):
        self.name = name
        self.race = race
        self.role = role
        self.style = style
        self.tone = tone
        self.emotions = emotions
        self.backstory = backstory
        self.relationships = relationships or {}

    @staticmethod
    def from_json(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return Character(
            name=data["name"],
            race=data["race"],
            role=data["role"],
            style=data["style"],
            tone=data["tone"],
            emotions=data["emotions"],
            backstory=data.get("backstory", ""),
            relationships=data.get("relationships", {})
        )

    def generate_prompt(self, user_input: str, summary: str = "", history: list = []) -> str:
        prompt = (
            f"Postać RP: {self.name}\n"
            f"Rasa: {self.race}\n"
            f"Rola: {self.role}\n"
            f"Styl: {self.style}\n"
            f"Ton: {self.tone}\n"
            f"Emocje: {', '.join(self.emotions)}\n"
            f"Język: polski\n"
            f"Narracja: emocjonalna, opisowa, interaktywna\n"
        )
        if self.backstory:
            prompt += f"Historia: {self.backstory}\n"
        if self.relationships:
            rels = "\n".join([f"- {k}: {v}" for k, v in self.relationships.items()])
            prompt += f"Relacje:\n{rels}\n"
        if summary:
            prompt += f"\n### STRESZCZENIE\n{summary}\n"

        seen = set()
        for msg in history[-6:]:
            if msg["text"] not in seen:
                prompt += f"\n{msg['sender']}: {msg['text']}"
                seen.add(msg["text"])

        prompt += f"\n{{user}}: {user_input}\n### ODPOWIEDŹ\n{self.name}:"
        return prompt
```
```location.py
import json

class Location:
    def __init__(self, name, description, atmosphere="", weather=""):
        self.name = name
        self.description = description
        self.atmosphere = atmosphere
        self.weather = weather

    def get_context(self):
        return (
            f"Lokacja: {self.name}\n"
            f"Opis: {self.description}\n"
            f"Atmosfera: {self.atmosphere}\n"
            f"Pogoda: {self.weather}"
        )

    @staticmethod
    def from_json(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return Location(
            name=data["name"],
            description=data["description"],
            atmosphere=data.get("atmosphere", ""),
            weather=data.get("weather", "")
        )
```
```narrative.py
import random

class NarrativeEngine:
    def __init__(self, characters, location):
        self.characters = {char.name: char for char in characters}
        self.location = location
        self.queue = []


    def detect_target(self, user_input: str) -> str:
        for name in self.characters:
            if f"@{name}" in user_input:
                return name
        return list(self.characters.keys())[0]

    def build_prompt(self, user_input: str, summary: str, history: list) -> tuple:
        target = self.detect_target(user_input)
        self.queue = [target] + random.sample(
            [n for n in self.characters if n != target], k=min(2, len(self.characters) - 1)
        )
        character = self.characters[target]
        prompt = character.generate_prompt(user_input, "", history)

        return prompt, character.name
```
```session.py
class SessionMemory:
    def __init__(self):
        self.history = []
        self.summary = ""

    def add_message(self, sender, text, quality="ok", ratings=None):
        self.history.append({
            "sender": sender,
            "text": text,
            "quality": quality,
            "ratings": ratings or {}
        })

    def get_recent(self, n=4):
        return self.history[-n:]

    def update_summary(self, new_summary):
        self.summary = new_summary

    def clean_history(self):
        seen = set()
        cleaned = []
        for msg in self.history:
            if msg["text"] not in seen:
                cleaned.append(msg)
                seen.add(msg["text"])
        return cleaned[-3:]
def summarize_chat(history, tokenizer, model):
    recent = [f"{msg['sender']}: {msg['text']}" for msg in history[-6:]]
    prompt = (
        "Streść rozmowę między użytkownikiem a postacią lub postaciami RP w maksymalnie 3 zdaniach. "
        "Nie dodawaj nowych wydarzeń ani postaci. Użyj tylko tego, co jest w historii:\n"
        + "\n".join(recent)
        + "\n\nStreszczenie:"
    )



    inputs = tokenizer(prompt, return_tensors="pt", padding=True).to("cuda")
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        temperature=0.7,
        top_p=0.9,
        repetition_penalty=1.2,
        no_repeat_ngram_size=3,
        do_sample=True,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.pad_token_id
    )

    summary = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
    return summary
```
```tagger.py
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
```
```utils.py
import os, json, uuid
from datetime import datetime
from core.tagger import TagEngine

def detect_incomplete_response(response: str) -> bool:
    if not response.strip():
        return True
    if len(response.split()) < 5:
        return True
    if response.endswith(("...", "-", ":", ",")):
        return True
    if response[-1].isalnum() and not response.endswith((".", "!", "?")):
        return True
    return False

def retry_if_empty(response: str, prompt: str, tokenizer, model) -> str:
    if detect_incomplete_response(response):
        inputs = tokenizer(prompt, return_tensors="pt", padding=True).to("cuda")
        outputs = model.generate(
            **inputs,
            max_new_tokens=250,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.3,
            no_repeat_ngram_size=3,
            do_sample=True,
            early_stopping=True,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id
        )
        return tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=True).strip()
    return response



def save_rating_to_json(prompt, response, ratings, character_name, location_name, tags=None):
    os.makedirs("ratings", exist_ok=True)

    prompt = prompt.replace("Użytkownik", "{{user}}")
    response = response.replace("Użytkownik", "{{user}}")

    meta = {
        "scene": location_name,
        "active_character": character_name,
        "timestamp": datetime.now().isoformat(),
        "tags": tags or [],
        "edited": True
    }

    data = {
        "prompt": prompt,
        "response": response,
        "ratings": ratings,
        "meta": meta
    }

    filename = f"ratings/{uuid.uuid4().hex}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
```
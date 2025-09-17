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

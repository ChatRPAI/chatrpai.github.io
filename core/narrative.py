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

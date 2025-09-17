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

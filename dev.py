from flask import Flask, request, jsonify, render_template
import time
import json
import os
import random

app = Flask(__name__, template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")

@app.route("/characters")
def characters():
    return render_template("characters.html")


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    user_input = data.get("prompt", "")

    # Symulacja czasu generowania
    time.sleep(0.5)

    user = "{{user}}"

    responses = [
        {
            "sessionId": "dev-session-001",
            "id": 123,
            "text": f"[DEV MODE] Witaj, {user}! Powiedziałeś mi: {user_input}",
            "sender": "Lytha",
            "tags": ["forest", "healing"],
            "avatarUrl": "/static/NarrativeIMG/Avatars/Lytha.png",
            "timestamp": "2025-09-11 21:10:00",
            "generation_time": 5.5
        },
        {
            "sessionId": "dev-session-001",
            "id": 124,
            "text": f"[DEV MODE] Witaj, {user}! Powiedziałeś mi: {user_input}",
            "sender": "Aria",
            "tags": ["Lytha", "forest"],
            "avatarUrl": "/static/NarrativeIMG/Avatars/Aria.jpg",
            "timestamp": "2025-09-11 09:11:00",
            "generation_time": 0.5
        },
        {
            "sessionId": "dev-session-001",
            "id": 125,
            "text": f"[DEV MODE] Witaj, {user}! Powiedziałeś mi: {user_input}",
            "sender": "Xardas",
            "tags": ["forest"],
            "avatarUrl": "/static/NarrativeIMG/Avatars/Xardas.jpg",
            "timestamp": "2025-09-11 16:12:00",
            "generation_time": 20.5
        }
    ]

    return jsonify(random.choice(responses))


@app.route("/edit", methods=["POST"])
def edit():
    data = request.get_json()
    edited_text = data.get("edited", "")
    tags = data.get("tags", [])
    sender = data.get("sender", "Lytha")

    return jsonify({
    "id": data.get("msgId", 999),
    "text": data.get("editedText",""),
    "tags": data.get("tags", []),
    "sender": "Lytha",
    "avatarUrl": "/static/NarrativeIMG/Avatars/Lytha.png"
    })


@app.route("/rate", methods=["POST"])
def rate():
    data = request.get_json()
    print(f"[DEV MODE] Otrzymano ocenę: {data}")
    return jsonify({ "status": "ok" })

@app.route("/messages", methods=["POST"])
def post_message():
    data = request.get_json()
    sender = data.get("sender", "Użytkownik")
    text = data.get("text", "")
    tags = data.get("tags", [])
    avatar = data.get("avatar", f"/static/NarrativeIMG/Avatars/{sender}.png")

    return jsonify({
        "id": 321,
        "text": text,
        "tags": tags,
        "sender": sender,
        "avatarUrl": avatar,
        "timestamp": "2025-09-11 16:09:00"
    })

@app.route("/tags", methods=["GET"])
def get_tags():
    try:
        with open("tags.json", "r", encoding="utf-8") as f:
            tags = json.load(f)
        return jsonify(tags)
    except Exception as e:
        print(f"[ERROR] Nie udało się wczytać tags.json: {e}")
        return jsonify({ "error": "Nie można załadować tagów." }), 500


if __name__ == "__main__":
    app.run(host="192.168.0.87", port=5000, debug=True)

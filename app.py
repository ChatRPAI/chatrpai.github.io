from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import time

from core.character import Character
from core.session import SessionMemory
from core.narrative import NarrativeEngine
from core.utils import detect_incomplete_response, retry_if_empty, save_rating_to_json
from core.location import Location

import os, uuid
from core.character import Character


app = Flask(__name__, template_folder="templates")

# # 🔧 Model i tokenizer
MODEL_PATH = "Bielik-7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    torch_dtype=torch.float16,
    device_map="auto"
)

# 🧠 Pamięć sesji
session = SessionMemory()

# 🧝‍♀️ Postacie w scenie
characters = []
for filename in os.listdir("characters"):
    if filename.endswith(".json"):
        path = os.path.join("characters", filename)
        try:
            characters.append(Character.from_json(path))
        except Exception as e:
            print(f"⚠️ Błąd wczytywania {filename}: {e}")
print("🧝‍♀️ Załadowane postacie:", [c.name for c in characters])


# 🌍 Lokalizacja

from core.location import Location
location = Location.from_json("locations/forest.json")
print("🌍 Aktywna lokalizacja:", location.name)

# 🧠 Silnik narracyjny
engine = NarrativeEngine(characters, location=location)


    # Helper to find message by message_id
def find_message_by_id(message_id):
    try:
        idx = int(message_id.split()[0])
        return session.history[idx] if 0 <= idx < len(session.history) else None
    except Exception:
        return None


# 🔧 Endpointy
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    user_input = data.get("prompt", "")
    session.add_message("Użytkownik", user_input)

    final_prompt, active_character = engine.build_prompt(user_input, session.summary, session.clean_history())

    start_time = time.time()
    inputs = tokenizer(final_prompt, return_tensors="pt", padding=True).to("cuda")
    outputs = model.generate(
        **inputs,
        max_new_tokens=200,
        temperature=0.7,
        top_p=0.9,
        repetition_penalty=1.3,
        no_repeat_ngram_size=3,
        do_sample=True,
        early_stopping=True,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.pad_token_id
    )
    end_time = time.time()
    duration = round(end_time - start_time, 2)

    raw_output = tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
    response = raw_output.split(f"{active_character}:")[-1].strip()
    response = retry_if_empty(response, final_prompt, tokenizer, model)

    quality = "ok"
    if detect_incomplete_response(response):
        quality = "cut"
    elif not response.strip():
        quality = "empty"

    session.add_message(active_character, response, quality=quality)

    if len(session.history) % 6 == 0:
        from core.session import summarize_chat
        new_summary = summarize_chat(session.history, tokenizer, model)
        session.update_summary(new_summary)
        print("📝 Nowe streszczenie:", session.summary)
        print("🧠 Aktywna postać:", active_character)

    print("🌍 Lokalizacja:", engine.location.name)
    print("🧠 Historia:", len(session.history))
    print("📜 Prompt:\n", final_prompt)
    print("🕒 Czas generowania:", duration, "sekundy")
    print("📦 Odpowiedź:\n", response)

    message_id = f"{len(session.history) - 1} {uuid.uuid4().hex}"

    return jsonify({
        "messageID": message_id,
        "response": response,
        "generation_time": f"{duration} sekundy"
    })


@app.route("/rate", methods=["POST"])
def rate():
    data = request.get_json()
    ratings = data.get("ratings", {})
    for i in reversed(range(len(session.history))):
        if session.history[i]["sender"] in engine.characters:
            prompt, active_char = engine.build_prompt(session.history[i]["text"], session.summary, session.get_recent())
            message_id = find_message_by_id(data.get("messageID", ""))
            save_rating_to_json(
                message_id,
                prompt,
                session.history[i]["text"],
                ratings,
                active_char,
                engine.location.name
            )
            break
    return jsonify({"status": "ok"})



@app.route("/edit", methods=["POST"])
def edit():
    data = request.get_json()
    edited_text = data.get("edited", "")
    tags = data.get("tags", [])
    if not edited_text.strip():
        return jsonify({"status": "empty"})

    for i in reversed(range(len(session.history))):
        if session.history[i]["sender"] in engine.characters:
            prompt, active_char = engine.build_prompt(session.history[i]["text"], session.summary, session.get_recent())
            from core.utils import save_rating_to_json
            message_id = find_message_by_id(data.get("messageID", ""))
        
            save_rating_to_json(
                message_id,
                prompt, edited_text,
                session.history[i].get("ratings", {}),
                active_char, engine.location.name,
                tags=tags
            )
            break

    return jsonify({"status": "saved"})










if __name__ == "__main__":
    app.run(host="192.168.0.87", port=5000)

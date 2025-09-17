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

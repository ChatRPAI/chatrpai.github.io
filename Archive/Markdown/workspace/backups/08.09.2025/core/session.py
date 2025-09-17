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



```js
/**
 * FEEDBACK KAMILA (12.09.2025)
 * =============================
 * - ✅ Klasa `BackendAPI` abstrahuje komunikację z backendem i zapewnia spójne metody HTTP
 * - ✅ Obsługuje generowanie, ocenianie i edytowanie wiadomości
 * - ✅ Integruje się z `RequestRetryManager` dla odporności na błędy sieciowe
 * - ✅ Możliwość dodania metod: `getSessionMessages()`, `deleteMessage()`, `uploadImage()`, `setAuthToken()`
 * - ❌ Refaktoryzacja nie jest konieczna — kod jest modularny i dobrze rozdzielony
 */

/**
 * BackendAPI
 * ==========
 * Warstwa komunikacji z backendem:
 * - Obsługuje generowanie odpowiedzi, ocenianie i edycję
 * - Wykorzystuje `fetch` z metodą POST i JSON
 */
class BackendAPI {
  /**
   * Wysyła prompt użytkownika do backendu.
   * @param {string} prompt
   * @returns {Promise<Object>}
   */
  async generate(prompt) {
    const res = await RequestRetryManager.fetchWithRetry(
      "/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      },
      3, // max 3 próby
      1000 // 1s opóźnienia
    );
    return res.json();
  }

  /**
   * Przesyła oceny odpowiedzi AI.
   * @param {Object} ratings
   * @returns {Promise<Object>}
   */
  async rate(ratings) {
    const res = await RequestRetryManager.fetchWithRetry(
      "/rate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratings),
      },
      3,
      1000
    );
    return res.json();
  }

  /**
   * Przesyła edytowaną odpowiedź z tagami.
   * @param {string} editedText
   * @param {Object} tags
   * @returns {Promise<Object>}
   */
  async edit(editedText, tags) {
   const res = await RequestRetryManager.fetchWithRetry(
     "/edit",
     {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ editedText, tags })
     },
     3,
     1000
   );
    return res.json();
  }

    /**
   * Przesyła wiadomość użytkownika do backendu.
   * @param {{ sender: string, text: string }} message
   * @returns {Promise<Object>}
   */
  async postMessage({ sender, text }) {
  const res = await fetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, text })
  });
  return res.json(); // → { id, sender, text, timestamp, tags? }
}

}
```
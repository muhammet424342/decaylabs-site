// Netlify serverless function — Decay Labs AI assistant, proxied to DeepSeek.
// Set DEEPSEEK_API_KEY in Netlify: Site settings → Environment variables (NEVER commit it).
// Without a key it returns a friendly "not configured yet" message (site never breaks).

const SYSTEM = `You are the friendly assistant for "Decay Labs", an NFT collection of 1,000 hand-illustrated undead "survivor" characters, built on the Base blockchain (an Ethereum Layer-2).
Key facts:
- 1,000 total supply, ERC-721 standard, floor price around 0.005 ETH.
- Verified on Basescan; contract 0x65F5e8006F4eF730d6984836F606a5C5c516CdC8 on Base.
- Buy / view on OpenSea: https://opensea.io/collection/decaylabs-395322216
- Follow on X: https://x.com/Decaylabss
Help visitors understand the collection, how to buy on Base via OpenSea, wallet/network basics, and the project's decayed/apocalypse theme.
Rules: Be concise (2-4 sentences). Be warm and a little playful, matching the horror/decay vibe. Never give financial advice or price predictions — if asked, politely decline. Reply in the same language the visitor uses.`;

exports.handler = async (event) => {
  const headers = { "content-type": "application/json" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "POST only" }) };
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return { statusCode: 200, headers, body: JSON.stringify({
      reply: "The AI guide isn't switched on yet. Meanwhile, explore the survivors on OpenSea or say hi on X @Decaylabss." }) };
  }

  let messages = [];
  try { messages = (JSON.parse(event.body || "{}").messages) || []; } catch (e) {}
  messages = messages
    .filter((m) => m && m.content)
    .slice(-8)
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 1000) }));

  try {
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: SYSTEM }, ...messages],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });
    if (!r.ok) {
      return { statusCode: 200, headers, body: JSON.stringify({ reply: "I'm having a rotten moment — try again in a sec." }) };
    }
    const d = await r.json();
    const reply = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || "").trim();
    return { statusCode: 200, headers, body: JSON.stringify({ reply: reply || "…" }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ reply: "I'm having a rotten moment — try again in a sec." }) };
  }
};

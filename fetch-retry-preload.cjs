// Vercel CLI'nin kullandigi global fetch'i, baglanti hatalarinda otomatik tekrar
// deneyen bir sarmalayiciyla degistirir. Kararsiz (yari yariya dusen) ag icin.
const orig = globalThis.fetch;
if (typeof orig === 'function') {
  globalThis.fetch = async (...args) => {
    let lastErr;
    for (let i = 0; i < 10; i++) {
      try {
        return await orig(...args);
      } catch (e) {
        lastErr = e;
        const code = String(e && (e.cause && e.cause.code) || e && e.name || e || '');
        // sadece baglanti/timeout hatalarinda tekrar dene
        if (!/timeout|fetch failed|CONNECT|ECONN|ENET|EAI_AGAIN|socket/i.test(code)) throw e;
        await new Promise(r => setTimeout(r, 400));
      }
    }
    throw lastErr;
  };
  process.stderr.write('[fetch-retry] global fetch sarmalandi (10x retry)\n');
}

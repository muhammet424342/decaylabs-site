# Decay Labs — Yayınlama Rehberi (Vercel)

Bu site saf statik (HTML/CSS/JS), build adımı yok. En kolay yol Vercel CLI.

## Yöntem 1 — Vercel CLI (önerilen)

PowerShell'i aç ve sırayla:

```powershell
# 1) Vercel CLI'yi global kur (bir kez)
npm i -g vercel

# 2) Proje klasörüne gir
cd "$env:USERPROFILE\Desktop\NFT\decaylabs_archive"

# 3) Vercel hesabına giriş (tarayıcı açılır, onayla)
vercel login

# 4) Önizleme (preview) deploy — soruları Enter'la geç:
#    Set up and deploy? Y
#    Which scope? (hesabını seç)
#    Link to existing project? N
#    Project name? decaylabs   (istediğini yaz)
#    In which directory is your code? ./   (Enter)
#    Auto-detected settings? Y
vercel

# 5) Canlı (production) deploy:
vercel --prod
```

Son komut sana `https://decaylabs-xxxx.vercel.app` gibi canlı bir adres verir.

## Yöntem 2 — GitHub üzerinden (otomatik deploy)

1. Bu klasörü bir GitHub reposuna yükle.
2. https://vercel.com → **Add New → Project → Import** ile repoyu seç.
3. Framework: **Other**, build command boş, output dir boş bırak → **Deploy**.
4. Bundan sonra her `git push` otomatik yeni deploy yapar.

## Özel alan adı (decaylabs.xyz gibi)

Vercel Dashboard → ilgili Proje → **Settings → Domains → Add** → alan adını yaz,
DNS kayıtlarını (Vercel'in gösterdiği) domain sağlayıcına ekle.

## Gerçek OpenSea verisi (floor / owners / volume)

Site, `api/stats.js` adlı Vercel serverless fonksiyonu üzerinden OpenSea'den canlı
veri çeker (anahtar tarayıcıda görünmez). Çalışması için:

1. OpenSea API anahtarı al: https://docs.opensea.io/reference/api-keys
2. Vercel Dashboard → Proje → **Settings → Environment Variables** →
   - Name: `OPENSEA_API_KEY`
   - Value: (anahtarın)
   - Tüm ortamlar (Production/Preview/Development) seçili → **Save**
3. Yeniden deploy et (`vercel --prod` veya yeni bir git push).

Anahtar yoksa site bozulmaz — bilinen gerçek değerlere düşer (floor 0.005 Ξ, 1.000 supply).
Lokal `python http.server`'da `/api` çalışmaz; gerçek veriyi test etmek için `vercel dev` kullan.

## Connect Wallet

`script.js`'teki Connect Wallet butonu şu an placeholder (uyarı gösterir). Gerçek mint için
web3 kütüphanesi (wagmi/viem veya thirdweb) bağlanmalı — istersen ekleriz.

## OpenSea royalty (%10) — siteden DEĞİL, OpenSea'den değişir

1. https://opensea.io → cüzdanla giriş → **Studio** (studio.opensea.io)
2. **My Collections → Decay Labs → Edit** (veya Earnings / Creator earnings)
3. **Creator earnings**'i %10'dan istediğin orana (ör. %0) çek → kaydet.

Not: %0 yaparsan ikincil satışlardan gelir almazsın. Bunu sen yapmalısın (hesabın + finansal karar).

# Decay Labs — Yayınlama Rehberi (Vercel)

Bu site saf statik (HTML/CSS/JS), build adımı yok. En kolay yol Vercel CLI.

## Yöntem 1 — Vercel CLI (önerilen)

PowerShell'i aç ve sırayla:

```powershell
# 1) Vercel CLI'yi global kur (bir kez)
npm i -g vercel

# 2) Proje klasörüne gir
cd "$env:USERPROFILE\Desktop\decaylabs_archive"

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

## Yayından önce doldurulacaklar

`index.html` içinde `<!-- TODO -->` ile işaretli linkler:
- OpenSea koleksiyon linki
- Basescan kontrat adresi (`https://basescan.org/address/0x...`)
- X / Twitter
- Discord

`script.js` içindeki **Connect Wallet** butonu şu an placeholder; gerçek mint için
bir web3 kütüphanesi (ör. wagmi/viem veya thirdweb) bağlanması gerekir — istersen onu da ekleriz.

Geri sayım tarihi `script.js` en üstte: `const MINT_DATE = new Date("2026-07-21T18:00:00Z");`
— gerçek mint tarihinle değiştir. Mint fiyatı `MINT_PRICE = 0.005`, max adet `MINT_MAX = 10`.

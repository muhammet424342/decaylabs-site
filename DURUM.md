# Decay Labs — DURUM
Son güncelleme: 2026-08-31 (canlı PC kontrolü)

## Hedef
İlk gerçek satış değil; önce 5–10 gerçek sahip + çalışan görsel/claim hunisi. 1.000 parçayı satmak bu aşamanın işi değil.

## Bugün doğrulanan (31 Ağu canlı kontrol)
- Site/checkout canlı: stats + buy.js HTTP 200, 0,005 ETH Seaport quote
- Görsel düzeltmesi CANLIYA GİTMİŞ: `imageBaseUrl` = decaylabs.online/public/img, `.webp` çalışıyor (500.webp 200)
- `ev.decaylabs.online` hâlâ ölü — artık kullanılmıyor
- OpenSea: 1 sahip, 800 listed (%80), floor 0,005 ETH, 0 hacim, 0 teklif — değişmedi
- Kurucu: 1.000/1.000 token, ETH 0,000099 — değişmedi
- Vanta: mintOpen=true, report=001, arz 0. Kontrat artık BaseScan'de **doğrulanmış**. Holder 1 (arz 0; claim yok)
- Farcaster: 0/0, spam etiketi 0 (kötüleşmiş)
- X: 7 takipçi; bio Field Report'a çekilmiş; yanıtlar 1–2 görüntüleme

## Sıradaki adım (onay bekliyor)
1. Görsel tabanını `public/img/{id}.webp` yap (kod, cüzdan yok)
2. Kurucu Vanta 001 claim + 5 kişilik hediye
3. Listeleri 800 → ~24 (gas için ~0,002 ETH yükle)
4. Farcaster'da insan olarak follow+reply (0/0 grafı kır)

## Açık sorunlar
- OpenSea 7-günlük anahtar, bekçi yok
- Analytics kalıcı değil
- IPFS unpinned
- Vanta BaseScan'de doğrulanmamış
- `metadata-v2/` yayınlanmamalı (bozuk CID)

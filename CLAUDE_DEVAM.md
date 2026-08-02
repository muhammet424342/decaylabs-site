# Claude Devam — DecayLabs teknik teslimat devri

## Kullanıcı sınırları

- Kullanıcı tüm yerel teknik düzeltmeleri, testleri, dosya düzenlemelerini, commit ve GitHub push işlemlerini yetkilendirdi.
- Gerçek para harcama, wallet imzası, blockchain işlemi, OpenSea liste iptali, X/Discord hesabında paylaşım veya hesap ayarı değişikliği kullanıcı açıkça onaylamadan yapılmayacak.
- Kanıt olmadan hiçbir madde “tamamlandı” sayılmayacak. Kanıt: test çıktısı, dosya yolu, URL, HTTP sonucu veya ekran görüntüsü.

## Projeler

- Ana repo: `C:\Users\Muhammet\Desktop\NFT\decaylabs_archive`
- Starter repo: `C:\Users\Muhammet\Desktop\base-miniapp-buy-starter`
- Canlı site: `https://decaylabs.online`
- GitHub ana repo: `https://github.com/muhammet424342/decaylabs-site.git`
- X hesabı: `https://x.com/Decaylabss` (hesapta değişiklik yapılmadı)
- Collection contract: `0x65F5e8006F4eF730d6984836F606a5C5c516CdC8`
- Chain: Base mainnet, chain ID `8453`

## Bu turda yapılan ve doğrulanan değişiklikler

1. `checkout-rules.mjs` eklendi:
   - Base chain doğrulaması
   - token ID/address doğrulaması
   - transaction target/contract/price kontrolleri
   - kullanıcı dostu hata mesajı eşlemesi
2. `api/buy.js` güncellendi:
   - pozitif fiyatlı listing seçimi
   - `Access-Control-Allow-Origin`, `Referrer-Policy`, no-store başlıkları
   - `protocolAddress` ve collection `contract` alanları yanıt gövdesine eklendi
3. `scripts/build-content-pack.mjs` eklendi ve çalıştırıldı.
4. `ops/x/final-publishing-pack.json` üretildi:
   - 30 gün yapılandırılmış içerik
   - ilk 7 gün aynı paketin içinden hazır
   - 100 fikir: hook/tweet/visual/altText/CTA/purpose
   - 50 doğal İngilizce reply
   - profil ve pinned thread
5. Otomatik test kanıtı: `node --test` sonucu 6/6 başarılı.
6. `ops/audit/checkout-scenarios.md` eklendi (14 senaryo, manuel ve doğrulanabilir ayrımı).

## Hemen yapılacak işler

1. `git status --short` ile çalışma ağacını kontrol et.
2. `node --check api/buy.js`, `node --check checkout-rules.mjs`, `node --check scripts/build-content-pack.mjs` çalıştır.
3. `node --test` ve `node scripts/validate-site.mjs` çalıştır.
4. `metadata-v2` sayısını ve JSON geçerliliğini doğrula:
   - tam olarak 1000 token JSON + `contract.json`
   - token sırası 1–1000
   - duplicate name / eksik image URI kontrolü
5. `ops/external-actions.md` dosyasını şu sıraya göre yeniden yaz:
   - X
   - OpenSea
   - Listing cancellations
   - IPFS
   - Base URI
   - Discord
   - Final live check
   Her maddede şu alanlar zorunlu: Platform, Action, File, Menu, Account required, Wallet required, Risk, Verification, checkbox/status.
6. `ops/audit/security.md` ekle veya mevcutsa doğrula. En az şu bulguları severity ile yaz: rate limiting, remote viem import, raw console diagnostics, secrets, replay/order risks, contract/chain validation.
7. Responsive kanıt al: 320, 375, 390, 768, 1024, 1440 px. Browser skill Windows sandbox hatası verirse Chrome headless ile screenshot al; kanıt yoksa “manual/blocked” yaz.
8. Lighthouse kurulu değilse kurma zorunluluğu yok; “not available in environment” olarak raporla ve statik SEO/metadata/link kontrolleri yap.
9. OpenSea/IPFS/X/Discord hesap işlemlerini yapma; yalnızca dosya ve manuel adım hazırla.
10. Sonunda ana repo için commit + push:
    - git user: `muhammet424342 <muhammetkarakurt1234@gmail.com>`
    - `git add`, `git diff --cached --check`, `git commit`, `git push origin main`
11. Starter repo değiştiyse aynı doğrulama ve push işlemini starter’da da yap.
12. Vercel deploy gerekiyorsa `npx vercel deploy --prod --archive=tgz --yes`; sonra `curl` ile home, robots, sitemap, OG ve API invalid-address endpointlerini kontrol et.

## Manuel kullanıcı işlemleri — kesinlikle otomatik yapma

- X avatar/banner/bio/website yükleme, pinned thread yayınlama/sabitleme ve scheduling.
- OpenSea profil/collection metadata değişiklikleri ve listing cancellation.
- IPFS provider hesabına upload/pin.
- Base URI setter transaction ve herhangi bir wallet signature.
- Discord server/roller/moderasyon kurulumu.
- Gerçek satın alma veya wallet confirmation.

## Final rapor formatı

- Tamamlandı ve doğrulandı (kanıtla)
- Düzeltilerek tamamlandı (kanıtla)
- Hazırlandı fakat hesapta uygulanmadı
- Benim girişim gerekiyor
- Benim wallet imzam gerekiyor
- Yapılamadı / ortam engeli
- Güvenlik bulguları severity ile
- Kalan manuel işlemler
- Gerçek tamamlanma yüzdesi
- Site, Checkout, Mobil, Güvenlik, X, OpenSea, Metadata, IPFS, Discord, Topluluk Operasyonu puanları

## Önceki ortam notu

Browser ve Chrome kontrol skill’leri Windows sandbox’ta şu hatayla başlatılamadı: `SetTokenInformation(TokenDefaultDacl) failed: 1344`. Bu yüzden authenticated X/OpenSea görsel doğrulaması yapılmadı; bu bir kanıt eksikliği olarak raporlanmalı.


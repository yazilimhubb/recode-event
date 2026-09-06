# 81 SANCAK — recode-event

Recode etkinliği için hazırlanmış, Osmanlı temalı bir demo: saf HTML/CSS/JS
frontend + küçük bir Express backend. Depo bilerek dağınık/tekrarlı
bırakılmıştı; bu sürümde `RECODE NOTU` yorumlarının işaret ettiği maddeler
ele alındı.

## Neler değişti

**CSS tekrarı kaldırıldı** — `index.html`, `ferman.html`, `meyhane.html`,
`muharebe.html`, `sehirler.html` sayfalarında birebir tekrar eden CSS
(`:root` renkleri, `.navbar`, `.btn*`, `.canli`/`.nokta`, `footer`, vb.)
artık tek bir [`styles.css`](styles.css) dosyasında. Her sayfa kendine özgü
stilleri kendi `<style>` bloğunda tutuyor.

**Gerçek bir XSS açığı düzeltildi** — sancak/meyhane adı, hükümdar adı,
slogan gibi kullanıcı girdileri eskiden hiç kaçışlanmadan `innerHTML`'e
yazılıyordu; biri "sancak adı" alanına `<img src=x onerror=...>` gibi bir
değer girip vitrini/listeyi gören herkeste script çalıştırabilirdi. Artık
tüm sayfalarda [`assets/js/util.js`](assets/js/util.js)'teki `escapeHtml()`
kullanılıyor.

**Backend modülerleştirildi ve gerçek hale getirildi** — `server.js` artık
ince bir bağlama dosyası; asıl mantık `lib/` ve `routes/` altında:

- `lib/store.js` — veri artık `data/store.json`'a yazılıyor, sunucu yeniden
  başlasa da uçmuyor (eskiden sadece bellekteydi).
- `lib/rateLimit.js` — IP + anahtar bazlı basit bir cooldown. `/api/oy`
  30 dakikada bir, `/api/biat` ve `/api/il-biat` birkaç saniyede bir izin
  veriyor; aşılırsa `429` + `kalanSaniye` dönüyor.
- `routes/*.js` — her uç nokta grubu kendi dosyasında, gerçek girdi
  doğrulamasıyla (zorunlu alanlar, uzunluk sınırları, tip kontrolü).
- `server.js` — merkezi hata yakalama: bozuk JSON gövdesi `400`, bilinmeyen
  `/api/*` `404`, beklenmeyen hatalar `500` + loglanır.

**Sahte veri kaldırıldı** — `sehirler.html` eskiden her il için
`(plaka * 3) % 40 + 1` gibi uydurma bir formülle sahte bir biat sayısı
üretip `localStorage`'a yazıyordu. Yeni `/api/il-biat` uç noktası gerçek,
sunucuda kalıcı tutulan sayaçlar sunuyor; görülmemiş bir il gerçekten 0'dan
başlıyor.

**30 dakikalık oy kilidi eklendi** — `muharebe.html`'de hem istemci
tarafında (buton kilitlenir, geri sayım gösterilir) hem sunucu tarafında
(`429` ile gerçekten reddedilir). Not: eskiden *her* `fetch` hatası (gerçek
ağ kopması da, sunucunun bilerek attığı `429` da) aynı şekilde "yerelde
arttır"a düşüyordu — yani sunucu kilidi istemci tarafında bedavaya
aşılabiliyordu. Bu, `index.html`, `sehirler.html` ve `muharebe.html`'deki
ilgili fonksiyonlarda düzeltildi: `429` artık asla yerel artışa yol açmıyor.

## Bilerek kapsam dışı bırakılanlar

- Gerçek bir veritabanı (SQLite/Postgres) — JSON dosyası bu ölçekte yeterli,
  büyürse ilk taşınacak yer `lib/store.js`.
- Gerçek kullanıcı girişi (`index.html`'deki "☪ Giriş" butonu hâlâ
  placeholder) ve gerçek sosyal paylaşım linkleri (`muharebe.html`) — ayrı
  özellik istekleri, bu recode turunun kapsamı değil.
- `iller.js`'teki ilçe listeleri hâlâ eksik (sadece birkaç ilçe/il) —
  81 ilin tam ilçe listesini eklemek başlı başına bir iş, bu PR'a dahil
  edilmedi.

## Çalıştırma

```bash
npm install
npm start          # http://localhost:3000
# ya da
npm run dev        # node --watch ile
```

Kalıcı veri `data/store.json`'da tutulur (git'e dahil değil — ilk
çalıştırmada `lib/store.js` varsayılan veriyle otomatik oluşturur).

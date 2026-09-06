// =====================================================================
//  81 SANCAK  —  BACKEND  (Recode Etkinligi surumu)
// ---------------------------------------------------------------------
//  RECODE: asagidaki maddeler artik ele alindi --
//   [x] Veri artik data/store.json'a yaziliyor (bkz. lib/store.js),
//       sunucu yeniden baslasa da ucmuyor.
//   [x] POST rotalarinda gercek girdi dogrulamasi var (bkz. routes/*.js).
//   [x] /api/oy ve /api/biat icin IP+anahtar bazli cooldown var
//       (bkz. lib/rateLimit.js) -- 429 + kalanSaniye donuyor.
//   [x] Rotalar dosya basina bolundu (routes/sancaklar.js,
//       routes/muharebe.js, routes/meyhane.js, routes/il-biat.js).
//   [x] Merkezi hata yakalama + JSON gövde parse hatalarinda 400.
//
//  Kalan fikirler (bilerek disaride birakildi, kapsam disi):
//   - Gercek bir veritabani (SQLite/Postgres) -- JSON dosyasi bu
//     olcekte yeterli ama buyurse ilk tasinacak yer burasi.
//   - Gercek kullanici girisi (index.html'deki "Giris" butonu hala
//     placeholder) -- ayri bir ozellik, bu recode'un kapsami degil.
// =====================================================================
'use strict';

var express = require('express');

var sancaklarRouter = require('./routes/sancaklar');
var muharebeRouter = require('./routes/muharebe');
var meyhaneRouter = require('./routes/meyhane');
var ilBiatRouter = require('./routes/ilBiat');

var app = express();
var PORT = process.env.PORT || 3000;

// proxy arkasinda dogru istemci IP'sini almak icin (rate limit bunu kullanir)
app.set('trust proxy', true);

app.use(express.json({ limit: '64kb' }));
app.use(express.static(__dirname)); // html/css/js dosyalarini servis et

app.use('/api', sancaklarRouter);
app.use('/api', muharebeRouter);
app.use('/api', meyhaneRouter);
app.use('/api', ilBiatRouter);

// bilinmeyen /api/* rotalari icin duzgun bir 404 (varsayilan Express
// HTML sayfasi yerine JSON donuyor -- frontend zaten JSON bekliyor)
app.use('/api', function (req, res) {
  res.status(404).json({ ok: false, hata: 'Bilinmeyen uç nokta.' });
});

// merkezi hata yakalama: JSON body parse hatasi (bozuk istek govdesi)
// ya da rotalardan next(err) ile gelen herhangi bir hata buraya duser.
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, hata: 'Geçersiz JSON gövdesi.' });
  }
  console.error('Beklenmeyen hata:', err);
  res.status(500).json({ ok: false, hata: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

app.listen(PORT, function () {
  console.log('81 SANCAK backend ayakta -> http://localhost:' + PORT);
});

module.exports = app; // testlerin app'i require edebilmesi icin

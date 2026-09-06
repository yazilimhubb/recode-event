// =====================================================================
//  81 SANCAK — /api/il-biat rotalari (RECODE, yeni)
// ---------------------------------------------------------------------
//  sehirler.html eskiden her il icin "(plaka * 3) % 40 + 1" gibi uydurma
//  bir formulle sahte bir baslangic biat degeri uretiyordu (kod
//  icindeki RECODE notu tam olarak bunu isaret ediyordu: "gercek
//  veriyle degistir!"). Bu rota, gercek (sunucuda kalici tutulan) biat
//  sayaclarini sunar; bir il ilk goruldugunde gercekten 0'dan baslar.
// =====================================================================
'use strict';

var express = require('express');
var store = require('../lib/store');
var rateLimit = require('../lib/rateLimit');

var IL_BIAT_KILIT_MS = 5 * 1000; // ayni ile art arda tiklamayi yavaslat

var router = express.Router();

router.get('/il-biat', function (req, res) {
  res.json(store.get().ilBiat);
});

router.post('/il-biat', function (req, res) {
  var plaka = req.body && req.body.plaka;
  if (typeof plaka !== 'number' || !Number.isInteger(plaka) || plaka < 1 || plaka > 81) {
    return res.status(400).json({ ok: false, hata: 'plaka 1-81 arasında bir tam sayı olmalı.' });
  }

  var ip = req.ip;
  var kilit = rateLimit.dene(ip, 'il-biat:' + plaka, IL_BIAT_KILIT_MS);
  if (!kilit.izinli) {
    return res.status(429).json({ ok: false, hata: 'Çok hızlı, biraz bekle.', kalanSaniye: kilit.kalanSaniye });
  }

  var veri = store.get();
  veri.ilBiat[plaka] = (veri.ilBiat[plaka] || 0) + 1;
  store.kaydet();
  res.json(veri.ilBiat);
});

module.exports = router;

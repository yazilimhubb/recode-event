// =====================================================================
//  81 SANCAK — /api/muharebe ve /api/oy rotalari (RECODE)
// ---------------------------------------------------------------------
//  Eskiden hicbir sure kilidi yoktu, herkes istedigi kadar oy atabilirdi.
//  Simdi IP basina 30 dakikalik bir kilit var (bkz. lib/rateLimit.js).
//  429 dondugunde on-yuzun bunu YERELDE oy arttirarak atlatmamasi gerekir
//  -- bkz. muharebe.html'deki oyVer() yorum satirlari.
// =====================================================================
'use strict';

var express = require('express');
var store = require('../lib/store');
var rateLimit = require('../lib/rateLimit');

var OY_KILIT_MS = 30 * 60 * 1000; // 30 dakika

var router = express.Router();

router.get('/muharebe', function (req, res) {
  res.json(store.get().muharebe);
});

router.post('/oy', function (req, res) {
  var taraf = req.body && req.body.taraf;
  if (taraf !== 'A' && taraf !== 'B') {
    return res.status(400).json({ ok: false, hata: 'taraf "A" ya da "B" olmalı.' });
  }

  var ip = req.ip;
  var kilit = rateLimit.dene(ip, 'oy', OY_KILIT_MS);
  if (!kilit.izinli) {
    return res.status(429).json({
      ok: false,
      hata: 'Bu tarayıcıdan 30 dakikada bir oy kullanabilirsin.',
      kalanSaniye: kilit.kalanSaniye
    });
  }

  var veri = store.get();
  veri.muharebe[taraf]++;
  store.kaydet();
  res.json(veri.muharebe);
});

module.exports = router;

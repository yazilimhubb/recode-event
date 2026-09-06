// =====================================================================
//  81 SANCAK — /api/meyhane rotalari (RECODE)
// ---------------------------------------------------------------------
//  Eskiden hicbir dogrulama yoktu -- ayni isimde yuzlerce meyhane
//  acilabiliyordu (issue'da bahsedildigi gibi). Simdi ad zorunlu +
//  uzunluk siniri var, ve secim listeleri (meze/icki) sunucu tarafinda
//  da makul bir uzunluga kirpiliyor.
// =====================================================================
'use strict';

var express = require('express');
var store = require('../lib/store');

var router = express.Router();

router.get('/meyhane', function (req, res) {
  res.json(store.get().meyhaneler);
});

router.post('/meyhane', function (req, res) {
  var gövde = req.body || {};
  var ad = typeof gövde.ad === 'string' ? gövde.ad.trim() : '';

  if (ad.length < 2) {
    return res.status(400).json({ ok: false, hata: 'Meyhane adı en az 2 karakter olmalı.' });
  }
  if (ad.length > 60) {
    return res.status(400).json({ ok: false, hata: 'Meyhane adı 60 karakteri geçemez.' });
  }

  var mezeler = Array.isArray(gövde.mezeler)
    ? gövde.mezeler.filter(function (m) { return typeof m === 'string'; }).slice(0, 20)
    : [];

  var yeni = {
    id: Date.now(),
    ad: ad,
    il: typeof gövde.il === 'string' ? gövde.il.slice(0, 40) : '',
    ilce: typeof gövde.ilce === 'string' ? gövde.ilce.slice(0, 40) : '',
    amblem: typeof gövde.amblem === 'string' ? gövde.amblem.slice(0, 8) : '🍷',
    mezeler: mezeler,
    icki: typeof gövde.icki === 'string' ? gövde.icki.slice(0, 30) : '',
    hava: typeof gövde.hava === 'string' ? gövde.hava.slice(0, 60) : ''
  };

  var veri = store.get();
  veri.meyhaneler.push(yeni);
  store.kaydet();
  res.status(201).json({ ok: true, eklenen: yeni });
});

module.exports = router;

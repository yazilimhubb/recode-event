// =====================================================================
//  81 SANCAK — /api/sancaklar ve /api/biat rotalari (RECODE)
// =====================================================================
'use strict';

var express = require('express');
var store = require('../lib/store');
var rateLimit = require('../lib/rateLimit');

var BIAT_KILIT_MS = 30 * 1000; // ayni sancaga art arda biat spamini onlemek icin kisa bir kilit

var router = express.Router();

function metinDogrula(deger, alan, minUzunluk, maxUzunluk) {
  if (typeof deger !== 'string') return alan + ' metin olmalı.';
  var t = deger.trim();
  if (t.length < minUzunluk) return alan + ' en az ' + minUzunluk + ' karakter olmalı.';
  if (t.length > maxUzunluk) return alan + ' ' + maxUzunluk + ' karakteri geçemez.';
  return null;
}

router.get('/sancaklar', function (req, res) {
  res.json(store.get().sancaklar);
});

router.post('/sancaklar', function (req, res) {
  var gövde = req.body || {};

  var hatalar = [];
  var sehirHata = metinDogrula(gövde.sehir, 'Şehir', 2, 40);
  if (sehirHata) hatalar.push(sehirHata);
  var adHata = metinDogrula(gövde.ad, 'Sancak adı', 2, 60);
  if (adHata) hatalar.push(adHata);
  if (gövde.hukumdar !== undefined) {
    var hukumdarHata = metinDogrula(gövde.hukumdar, 'Hükümdar adı', 0, 40);
    if (hukumdarHata) hatalar.push(hukumdarHata);
  }
  if (gövde.slogan !== undefined) {
    var sloganHata = metinDogrula(gövde.slogan, 'Slogan', 0, 140);
    if (sloganHata) hatalar.push(sloganHata);
  }

  if (hatalar.length) {
    return res.status(400).json({ ok: false, hata: hatalar.join(' ') });
  }

  var veri = store.get();
  var yeni = {
    id: Number.isInteger(gövde.id) ? gövde.id : Math.floor(Math.random() * 1000000),
    sehir: String(gövde.sehir).trim(),
    ad: String(gövde.ad).trim(),
    tur: typeof gövde.tur === 'string' && gövde.tur.trim() ? gövde.tur.trim().slice(0, 40) : 'Yeni Ferman',
    slogan: typeof gövde.slogan === 'string' && gövde.slogan.trim() ? gövde.slogan.trim() : 'Slogan girilmedi',
    biat: 0,
    fiyat: 0,
    hukumdar: typeof gövde.hukumdar === 'string' && gövde.hukumdar.trim() ? gövde.hukumdar.trim() : 'Anonim Bey',
    ikon: typeof gövde.ikon === 'string' && gövde.ikon.trim() ? gövde.ikon.trim().slice(0, 8) : '⚑',
    zirve: false
  };
  veri.sancaklar.push(yeni);
  store.kaydet();
  res.status(201).json({ ok: true, eklenen: yeni });
});

router.post('/biat', function (req, res) {
  var id = req.body && req.body.id;
  if (typeof id !== 'number' || !Number.isFinite(id)) {
    return res.status(400).json({ ok: false, hata: 'Geçerli bir sancak id\'si gerekli.' });
  }

  var veri = store.get();
  var sancak = veri.sancaklar.find(function (s) { return s.id === id; });
  if (!sancak) {
    return res.status(404).json({ ok: false, hata: 'Sancak bulunamadı.' });
  }

  var ip = req.ip;
  var kilit = rateLimit.dene(ip, 'biat:' + id, BIAT_KILIT_MS);
  if (!kilit.izinli) {
    return res.status(429).json({ ok: false, hata: 'Çok hızlı biat ediyorsun, biraz bekle.', kalanSaniye: kilit.kalanSaniye });
  }

  sancak.biat++;
  store.kaydet();
  res.json({ ok: true, biat: sancak.biat });
});

module.exports = router;

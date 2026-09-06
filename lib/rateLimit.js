// =====================================================================
//  81 SANCAK — basit IP + anahtar bazli oy kilidi (RECODE)
// ---------------------------------------------------------------------
//  Eskiden /api/oy ve /api/biat sinirsizdi -- ayni kisi saniyede
//  yuzlerce oy atabilirdi. Bu modul, verilen "kilit anahtari" (ör.
//  "oy:A" ya da "biat:34") + istemci IP'sine gore basit bir bellek-ici
//  cooldown uygular. Gercek bir prod sistemde Redis gibi paylasimli bir
//  depo gerekir (birden fazla sunucu ornegi arasinda), ama tek surecli
//  bu recode demosu icin bellek yeterli.
// =====================================================================
'use strict';

var sonIstekler = new Map(); // "ip::anahtar" -> son izin verilen zaman (ms)

function anahtarOlustur(ip, anahtar) {
  return ip + '::' + anahtar;
}

/**
 * Verilen ip+anahtar kombinasyonu icin kalan bekleme suresini (saniye)
 * dondurur. 0 ise istek serbest.
 */
function kalanSaniye(ip, anahtar, kilitMs) {
  var k = anahtarOlustur(ip, anahtar);
  var son = sonIstekler.get(k);
  if (!son) return 0;
  var kalanMs = (son + kilitMs) - Date.now();
  return kalanMs > 0 ? Math.ceil(kalanMs / 1000) : 0;
}

/**
 * Istegin izinli olup olmadigini kontrol eder; izinliyse kilidi
 * BASLATIR (yani bu fonksiyonu sadece istegi gercekten islerken cagir).
 * Donus: { izinli: true } ya da { izinli: false, kalanSaniye: N }.
 */
function dene(ip, anahtar, kilitMs) {
  var kalan = kalanSaniye(ip, anahtar, kilitMs);
  if (kalan > 0) {
    return { izinli: false, kalanSaniye: kalan };
  }
  sonIstekler.set(anahtarOlustur(ip, anahtar), Date.now());
  return { izinli: true };
}

// bellek sizintisini onlemek icin eski kayitlari arada temizle
// (bu demo tek bir kilit suresi (30dk) kullaniyor, 2 saatten eski kayit
// kesinlikle artik alakasizdir)
setInterval(function () {
  var esik = Date.now() - 2 * 60 * 60 * 1000;
  sonIstekler.forEach(function (zaman, anahtar) {
    if (zaman < esik) sonIstekler.delete(anahtar);
  });
}, 15 * 60 * 1000).unref();

module.exports = { dene: dene, kalanSaniye: kalanSaniye };

// =====================================================================
//  81 SANCAK — ortak yardimci fonksiyonlar (RECODE)
// ---------------------------------------------------------------------
//  escapeHtml: kullanici girdisini innerHTML'e yazmadan once kacisla.
//  Onceki halde sancak adi / hukumdar adi / meyhane adi gibi alanlar
//  hicbir kacislama yapilmadan dogrudan innerHTML'e yaziliyordu; biri
//  "sancak adi" alanina <img src=x onerror=alert(1)> gibi bir deger
//  girip vitrin/liste sayfasini goren herkeste script calistirabilirdi.
//  Bu dosya butun sayfalarda kullaniciya ait metinleri basmadan once
//  gecmesi gereken tek nokta.
// =====================================================================
(function (global) {
  'use strict';

  var KACIS_TABLO = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  function escapeHtml(deger) {
    if (deger === null || deger === undefined) return '';
    return String(deger).replace(/[&<>"']/g, function (c) {
      return KACIS_TABLO[c];
    });
  }

  global.escapeHtml = escapeHtml;
})(window);

// =====================================================================
//  81 SANCAK — kalici veri katmani (RECODE)
// ---------------------------------------------------------------------
//  Eskiden her sey sadece bellekteki degiskenlerde tutuluyordu; sunucu
//  yeniden baslayinca (nodemon, deploy, crash...) her sey ucuyordu.
//  Bu dosya ayni veriyi bir JSON dosyasina (data/store.json) yazip
//  okuyarak kalici hale getirir. Gercek bir veritabani degil ama
//  "recode etkinligi" olcegine gore makul bir adim -- bir sonraki
//  adim gercek bir DB'ye (SQLite/Postgres) tasimak olabilir.
// =====================================================================
'use strict';

var fs = require('fs');
var path = require('path');

var DOSYA_YOLU = path.join(__dirname, '..', 'data', 'store.json');

var VARSAYILAN_VERI = {
  sancaklar: [
    {id:34, sehir:"İstanbul", ad:"İstanbulun Sefiri", tur:"Hünkâr Sancağı", slogan:"Biat edene özgürlük", biat:11, fiyat:0, hukumdar:"Kültigi Kaan", ikon:"🕌", zirve:true},
    {id:22, sehir:"Edirne",   ad:"Edirne Sancağı",     tur:"Youtube Kanalım", slogan:"Siz olun abiler konuşurken araya girmesin.", biat:1, fiyat:0, hukumdar:"Akazinyo", ikon:"▶", zirve:false},
    {id:6,  sehir:"Adana",    ad:"Çukurova Sancağı",   tur:"Şırdan Locası",   slogan:"Şırdan bizden sorulur.", biat:7, fiyat:0, hukumdar:"Toroslu", ikon:"🌶", zirve:false},
    {id:35, sehir:"İzmir",    ad:"Ege Sancağı",        tur:"Gençlik Boyu",    slogan:"Rüzgar bizden yana.", biat:5, fiyat:0, hukumdar:"Efe", ikon:"⚓", zirve:false}
  ],
  muharebe: { A: 147, B: 140 },
  meyhaneler: [],
  ilBiat: {}
};

function derinKopya(deger) {
  return JSON.parse(JSON.stringify(deger));
}

function veriyiYukle() {
  try {
    var ham = fs.readFileSync(DOSYA_YOLU, 'utf8');
    var yuklenen = JSON.parse(ham);
    // eksik alanlari varsayilanla tamamla (dosya eski surumden kalmis olabilir)
    return Object.assign({}, derinKopya(VARSAYILAN_VERI), yuklenen);
  } catch (err) {
    // dosya yok ya da bozuk -- varsayilanla basla
    return derinKopya(VARSAYILAN_VERI);
  }
}

var veri = veriyiYukle();

function kaydet() {
  try {
    fs.mkdirSync(path.dirname(DOSYA_YOLU), { recursive: true });
    // once gecici dosyaya yaz, sonra yeniden adlandir -- yazma sirasinda
    // sunucu kapanirsa store.json'un yarim/bozuk kalmamasi icin.
    var gecici = DOSYA_YOLU + '.tmp';
    fs.writeFileSync(gecici, JSON.stringify(veri, null, 2), 'utf8');
    fs.renameSync(gecici, DOSYA_YOLU);
  } catch (err) {
    console.error('store.json yazilamadi:', err.message);
  }
}

module.exports = {
  get: function () { return veri; },
  kaydet: kaydet
};

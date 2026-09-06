// =====================================================================
//  81 SANCAK  —  BACKEND  (Recode Etkinligi surumu)
// ---------------------------------------------------------------------
//  DIKKAT: Bu backend BILEREK basit ve biraz "kotu" yazildi.
//  Amac: recode etkinliginde katilimcilar gelistirsin.
//
//  Bilinen eksikler / RECODE fikirleri:
//   - Veri sadece bellekte tutuluyor, sunucu kapaninca ucuyor
//     -> JSON dosyasina veya gercek veritabanina yaz.
//   - Hicbir girdi dogrulamasi yok -> input validation ekle.
//   - Oy icin sure/IP kilidi yok -> spam engeli ekle.
//   - Tek dosyada her sey -> route'lari ayir, temizle.
//   - Hata yonetimi zayif -> try/catch ve anlamli hata mesajlari.
// =====================================================================

var express = require('express');
var path = require('path');
var app = express();
var PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // html/css/js dosyalarini servis et

// -------- bellek "veritabani" (kotu ama calisir) --------
var sancaklar = [
  {id:34, sehir:"İstanbul", ad:"İstanbulun Sefiri", tur:"Hünkâr Sancağı", slogan:"Biat edene özgürlük", biat:11, fiyat:0, hukumdar:"Kültigi Kaan", ikon:"🕌", zirve:true},
  {id:22, sehir:"Edirne",   ad:"Edirne Sancağı",     tur:"Youtube Kanalım", slogan:"Siz olun abiler konuşurken araya girmesin.", biat:1, fiyat:0, hukumdar:"Akazinyo", ikon:"▶", zirve:false},
  {id:6,  sehir:"Adana",    ad:"Çukurova Sancağı",   tur:"Şırdan Locası",   slogan:"Şırdan bizden sorulur.", biat:7, fiyat:0, hukumdar:"Toroslu", ikon:"🌶", zirve:false},
  {id:35, sehir:"İzmir",    ad:"Ege Sancağı",        tur:"Gençlik Boyu",    slogan:"Rüzgar bizden yana.", biat:5, fiyat:0, hukumdar:"Efe", ikon:"⚓", zirve:false}
];

var muharebe = { A: 147, B: 140 }; // Adana vs Mersin

// kullanicilarin kurdugu meyhaneler (RECODE: bunu da dosyaya/DB'ye yaz)
var meyhaneler = [];

// -------- API: sancaklari getir --------
app.get('/api/sancaklar', function(req, res){
  res.json(sancaklar);
});

// -------- API: yeni sancak/ferman ekle --------
app.post('/api/sancaklar', function(req, res){
  var y = req.body;
  // RECODE: burada dogrulama yok! bos/kotu veri direkt giriyor.
  sancaklar.push(y);
  res.json({ ok: true, eklenen: y });
});

// -------- API: bir sancaga biat (oy) ver --------
app.post('/api/biat', function(req, res){
  var id = req.body.id;
  for (var i = 0; i < sancaklar.length; i++){
    if (sancaklar[i].id === id){
      sancaklar[i].biat++;
    }
  }
  res.json({ ok: true });
});

// -------- API: meydan muharebesi durumu --------
app.get('/api/muharebe', function(req, res){
  res.json(muharebe);
});

// -------- API: muharebede oy ver --------
app.post('/api/oy', function(req, res){
  var taraf = req.body.taraf; // "A" veya "B"
  // RECODE: 30 dakikalik oy kilidi burada olmali ama yok!
  if (taraf === 'A') muharebe.A++;
  else if (taraf === 'B') muharebe.B++;
  res.json(muharebe);
});

// -------- API: meyhaneleri getir --------
app.get('/api/meyhane', function(req, res){
  res.json(meyhaneler);
});

// -------- API: yeni meyhane kur --------
app.post('/api/meyhane', function(req, res){
  // RECODE: dogrulama yok, ayni isimde 100 meyhane acilabilir :)
  meyhaneler.push(req.body);
  res.json({ ok: true });
});

app.listen(PORT, function(){
  console.log("81 SANCAK backend ayakta -> http://localhost:" + PORT);
});

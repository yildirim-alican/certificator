# Test Rehberi

## Tip Kontrolü

```bash
cd frontend
npm run type-check
```

## Lint

```bash
npm run lint
```

## Production Build Testi

```bash
npm run build
```

Build başarıyla tamamlanıyorsa tüm sayfalar derleniyor demektir.

## Manuel Test Kontrol Listesi

### Temel akış

- [ ] Ana sayfa açılıyor
- [ ] "Create Certificate" butonu editöre yönlendiriyor
- [ ] Editörde düzen seçimi çalışıyor
- [ ] Element ekleme, taşıma, yeniden boyutlandırma çalışıyor
- [ ] "Create" butonu şablonu kaydediyor (sayfa yenilendikten sonra kalıcı)
- [ ] Ana sayfada şablon listesinde görünüyor

### PDF üretimi

- [ ] Export butonuna tıkla → modal açılıyor
- [ ] "Download PDF" → PDF indiriliyor
- [ ] PDF içeriği canvas ile eşleşiyor

### Toplu üretim

- [ ] Excel dosyası yükle
- [ ] Sütun eşlemesi gösteriliyor
- [ ] Generate → ZIP indirilip açılıyor, her kayıt için ayrı PDF var

### Şablon import/export

- [ ] Ana sayfada "Export" → JSON indirildi
- [ ] "Import" → JSON'dan şablonlar yüklendi, mevcut şablonlarla birleşti

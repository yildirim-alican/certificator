# Certificator — Kullanıcı Rehberi (Türkçe)

**Profesyonel sertifika tasarımı, üretimi ve yönetimi için kapsamlı rehber.**

---

## İçindekiler

1. [Başlarken](#başlarken)
2. [Dashboard Genel Bakış](#dashboard-genel-bakış)
3. [Şablon Oluşturma](#şablon-oluşturma)
4. [Canvas Editörü](#canvas-editörü)
5. [Element Yönetimi](#element-yönetimi)
6. [Tek Sertifika Oluşturma](#tek-sertifika-oluşturma)
7. [Toplu Sertifika Üretimi](#toplu-sertifika-üretimi)
8. [Şablon Yönetimi](#şablon-yönetimi)
9. [Klavye Kırpayları](#klavye-kırpayları)
10. [Sorun Giderme](#sorun-giderme)

---

## Başlarken

### Sistem Gereksinimleri
- **Modern web tarayıcı** (Chrome, Firefox, Safari, Edge — 2020+)
- **İnternet bağlantısı** (ilk yükleme için; sonra çevrimdışı çalışır)
- **Minimum 4GB RAM** (toplu işlemler için: 100+ sertifika)

### Kurulum

#### Seçenek 1: Tarayıcıda (En Kolay)
1. [https://certificator.example.com](https://certificator.example.com) açın
2. Sayfayı yer imlerine ekleyin
3. Hemen başlayın!

#### Seçenek 2: Yerel Geliştirme
```bash
git clone https://github.com/yourusername/certificator.git
cd certificator/frontend
npm install
npm run dev
```
Ardından **http://localhost:3000** açın

#### Seçenek 3: Windows Desktop Launcher
1. `/launcher/` klasöründeki `certificator-launcher.exe` indirin
2. Çift tıklayın → Tarayıcı otomatik açılır
3. Dev sunucu arka planda çalışır; kapatmak için window kapatın

### İlk Kez Kurulum
1. **Sertifika Oluştur** → Dashboard'da "+ Sertifika Oluştur" tıklayın
2. **Layout Seçin** → Digital, Minimal veya Modern şablonlardan seçin
3. **Özelleştir** → Metin düzenle, logo ekle, renkları ayarla
4. **Kaydet** → "Kaydet" tıklayarak tarayıcı depolamda kaydedin
5. **İndir** → PDF olarak dışa aktar veya toplu üret

---

## Dashboard Genel Bakış

Başlangıç sayfası **/), tüm sertifika şablonlarınızı ve hızlı işlev tuşlarını gösterir.

### Temel Alanlar

**Sol Panel — Şablon Listesi**
- Tüm kaydedilmiş sertifikaları gösterir
- Kartlar önizleme, ad ve değiştirilme tarihini gösterir
- Şablonu editörde açmak için karta tıklayın
- Arama kutusunu kullanarak ada göre filtreleyin

**Üst Bar — İşlemler**
- **+ Oluştur** → Yeni şablon başlat
- **İçe Aktar** → Şablonları JSON dosyasından yükle
- **Dışa Aktar** → Tüm şablonları JSON yedek olarak indir

**Şablon Kartı — Hızlı İşlemler**
- **Düzenle** → Editörde aç
- **Hızlı** → Canlı veri girişi ile tek sertifika oluştur
- **Kopyala** → Şablonun bir kopyasını oluştur
- **Sil** → Şablonu kaldır (onaylama istenecek)

---

## Şablon Oluşturma

### Adım 1: Layout Seçin

"Sertifika Oluştur" tıkladığınızda, üç kategori görürsünüz:

#### Yön & Boyutlandırma
- **Landskap (A4)** — 297mm × 210mm (yatay)
- **Portre (A4)** — 210mm × 297mm (dikey)

#### Layout Kategorileri
1. **Digital** — Modern, renkli, teknoloji odaklı tasarımlar
2. **Minimal** — Temiz, profesyonel, minimalist estetik
3. **Modern** — Çağdaş, geometrik şekiller, gradyanlar

**Seçim Rehberi:**
- Kurumsal/Profesyonel? → **Minimal** seçin
- Eğitim/Eğitim? → **Modern** seçin
- Ödüller/Tanınma? → **Digital** seçin

### Adım 2: Marka Logolarını Ekleyin

Sol yan panelde **"Logo Yönetimi"** tıklayarak logo sekvansını açın.

#### Logo Galerisi
- Yüklenen logoların küçük resimleri gösterir
- Logoya hover yaparken "Logo 1", "Logo 2" etiketlerini görürsünüz
- **×** düğmesine (kırmızı daire) tıklayarak logoyu kaldırın
- Logolar otomatik olarak yerleştirilir

#### Logo Yükleme
- **"+ Logo Ekle"** düğmesini tıklayın
- Resim dosyası seçin (PNG, JPG, SVG önerilir)
- Logo galeriye küçük resim olarak görünür
- İlk logo = Yayıncı Logosu (sol/orta pozisyon)
- Ek logolar = Sponsor Logoları (sertifika genelinde dağıtılır)

**En İyi Uygulamalar:**
- Kare veya yatay logolar kullanın (örn. 1:1 veya 2:1 en boy oranı)
- Çözünürlük: En az 150×150 piksel
- Saydamlığı olan PNG en iyi kalitedir
- Dosya boyutu 1 MB'den az tutun

### Adım 3: Şablon Ayrıntılarını Düzenleyin

Editörün üstünde:
- **Şablon Adı** — Sertifikanıza açıklayıcı bir ad verin
- **Kaydet** — Şablonu tarayıcı depolamasına kaydedin
- **Dışa Aktar** → PDF olarak indirin (tek sayfalı şablon önizlemesi)

---

## Canvas Editörü

### Canvas Genel Bakış

Ana düzenleme alanı, sertifikanızı gerçek boyutunda gösterir (150 DPI).

#### Referans Elementler
- **Sınır** — İçerisine yazdırılabilecek alanları gösteren ince gri çizgi
- **Rehberler** — Snap-to-grid hizalamayı gösteren sarı çizgiler
- **Elementler** — Canvas'ta konumlandırılmış metin, resim, şekiller

### Pan ve Zoom

#### Yakınlaştırma
| İşlem | Sonuç |
|-------|-------|
| `Ctrl + Kaydır` | Yakınlaştır/Uzaklaştır (20%–400%) |
| `100%` düğmesi | Ekrana sığdır *(önerilir)* |
| Scroll tekerleği | Dikey pan |
| `Shift + Kaydır` | Yatay pan |

#### Pan (Kaydırma)
| İşlem | Sonuç |
|-------|-------|
| Space + Sürükle | Göğe kaydır |
| Sağ tıkla sürükle | Alternatif pan yöntemi |

### Hizalama Rehberleri

Elementleri sürüklerken renkli rehberler görünür:

- **Sarı çizgiler** — Grid'e snap
- **Mavi çizgiler** — Diğer elementlerle hizala
- **Yeşil çizgiler** — Orta hizala
- **Alt + Sürükle** → Kenar mesafelerini göster

---

## Element Yönetimi

### Element Türleri

#### 1. Metin Elementleri
```
İçerik Türleri:
- Statik metin: "Başarı Sertifikası"
- Değişkenler: [recipient.name], [recipient.surname]
- Karışık: "Bu sertifika [recipient.name] tarafından tamamlandığını..."

Değişken Seçenekleri:
[recipient.name] — Kişinin adı
[recipient.surname] — Kişinin soyadı
[certificate.success_rate] — Özel değişken (örn. sınav puanı)
```

**Metni Düzenle:**
1. Metin elementini tıklayın
2. Sağ panel özellikleri gösterir
3. **İçerik** alanında yazın
4. Font, boyut, renk, hizalamayı ayarlayın

**Font Özellikleri:**
- Font ailesi (Arial, Verdana, Georgia, vb.)
- Boyut (8px–72px)
- Ağırlık (Normal, Kalın, vb.)
- Renk (renkçi açmak için tıklayın)
- Hizalama (Sol, Orta, Sağ)

#### 2. Resim Elementleri
- Logolar, mühürler, sınırlar, araligrafiler
- Desteklenen: PNG, JPG, SVG, GIF
- Tıklayarak yükle veya değiştir
- Özellikler: Ölçek, en boy oranı kilidi, saydamlık

#### 3. Şekil Elementleri
- **Dikdörtgen** — Renkli kutu, sınırlar, yuvarlak köşeler
- **Daire** — Rozetler, mühürler, sınırlar
- **Üçgen** — Dekoratif elementler
- **Gradyanlar** — Renk geçişleri (doğrusal veya radyal)

**Şekil Özellikleri:**
- Arka plan rengi
- Sınır rengi ve genişliği
- Sınır yarıçapı (yuvarlaklığı)
- Gradyan (açık/kapalı + açı)
- Saydamlık (şeffaflık)

### Element Seçme

#### Tek Seçim
```
Element üzerine tıklayın → Mavi vurgular
Sağ panel özellikleri gösterir
```

#### Çoklu Seçim
```
Shift + Tıkla birden fazla element
Ctrl+A tüm sınır olmayan elementleri seçer
Çift tıkla seçimini kaldır
```

#### Çoklu Seçim İşlemleri
- Beraber hareket ettir
- Hizala (sol, orta, sağ, üst, orta, alt)
- Toplu sil
- Saydamlığı beraber değiştir

### Konumlandırma & Boyutlandırma

#### Hareket
```
Element'i tıklayıp sürükle
Ok tuşları ±0.5% hareket
Shift + Ok tuşları ±1.5% hareket
```

#### Boyutlandırma
```
Köşe/kenar tutacağını sürükle
Shift + Sürükle en boy oranını tutar
Çift tıkla metni otomatik sığdır
```

#### Döndürme
```
Cmd/Ctrl + Köşeyi sürükle
Veya özellikler paneline açı giriniz
Snap açıları: 0°, 15°, 30°, 45°, 90°
```

#### Katman Paneli (Z-Index)
```
Sağ yan → "Katmanlar" sekmesi
Sırasını değiştirmek için sürükle (üst = ön)
Göster/gizle için göz ikonuna tıklayın
Yeniden adlandırmak için çift tıklayın
```

### Çoğaltma & Kopyalama

```
Ctrl+D — Seçili elementi çoğalt (yakında kalır)
Ctrl+C — Elementi kopyala
Ctrl+V — Yapıştır (orijinalin üzerine gelebilir)

Çoklu Çoğaltma:
1. Element seçin
2. Ctrl+D birden fazla kez
3. Her birini konumlandırmak için sürükleyin
```

### Element Silme

```
Element seçin + Delete tuşu
Veya Backspace
Veya sağ tıkla → Sil seçeneği
Yanlış sildiyseniz Geri Al (Ctrl+Z)
```

---

## Tek Sertifika Oluşturma

### Hızlı Oluştur (Hızlı)

1. **Dashboard'dan:**
   - Sertifika kartını bulun
   - **Hızlı** düğmesini tıklayın

2. **Veri Girin:**
   - Alıcı adı, soyadı, diğer değişkenler
   - Her alan şablon değişkenine karşılık gelir
   - Canlı önizleme yazarken güncellenir

3. **İndir:**
   - **PDF Oluştur** tıklayın
   - Dosya hemen indirilir
   - Toast bildirimi başarıyı doğrular

### Editörden Tam Oluştur

1. **Editörde:**
   - Üst bilgi paneline değişkenleri doldurun
   - **Dışa Aktar** düğmesini tıklayın

2. **Dışa Aktar Diyaloğu:**
   - Canlı önizleme sertifikayı verilerle gösterir
   - Dosya adı (şablon adından otomatik doldurulur)
   - **PDF İndir** tıklayın

3. **Dosya İşleme:**
   - İndirilenler klasörüne kaydedilir (standart konum)
   - Dosya adı: `[ŞablonAdı]_[Tarih].pdf`

---

## Toplu Sertifika Üretimi

### İş Akışı Genel Bakış

```
Dashboard → Şablon Kartı → "Toplu" tıklayın
    ↓
Toplu sayfa açılır
    ↓
Excel dosyası yükle (.xlsx)
    ↓
Sütun Haritalaması (otomatik veya manuel)
    ↓
Veri Önizlemesi (oluşturmadan doğrula)
    ↓
Sertifika Oluştur (toplu işlem)
    ↓
ZIP İndir (tüm PDF'ler paketlenir)
```

### Adım Adım

#### Adım 1: Excel Dosyası Yükle

1. **Toplu Sayfayı Açın:**
   - Editörden **Toplu** düğmesini tıklayın
   - Veya şablon kartından **Toplu** tıklayın

2. **Dosya Seçin:**
   - Yükleme alanına tıklayın veya .xlsx dosyasını sürükleyin
   - Desteklenen format: Excel 97-2016 (.xlsx, .xls)
   - Maks 10.000 satır kararlı performans için

3. **Dosya Gereksinimleri:**
   - İlk satır = sütun başlıkları
   - Başlıklar alıcı alanlarını adlandırmalıdır
   - Örnek başlıklar:
     ```
     Ad          Soyad      Tarih      Puan
     Ahmet       Yilmaz     2024-01-15 95
     Ayşe        Demir      2024-01-16 88
     ```

#### Adım 2: Sütun Haritalaması

Sistem Excel sütunlarını şablon değişkenlerine akıllı algoritma kullanarak otomatik eşleştirir.

**Otomatik Eşleştirme Örnekleri:**
```
Excel Başlığı         → Şablon Değişkeni
"Adı"                 → [recipient.name]
"Soyadı"              → [recipient.surname]
"Tamamlanma Tarihi"   → [certificate.date]
"Puan" / "Başarı"     → [certificate.success_rate]
```

**Manuel Haritalaması (Gerekirse):**
1. Otomatik eşleştirmeyi gözden geçirin
2. Herhangi bir sütun için açılır menüyü tıklayın
3. Doğru şablon değişkenini seçin
4. Eşleştirilmemiş sütunları "Atla" olarak bırakın
5. **İlerle** tıklayın

#### Adım 3: Veri Önizlemesi

İşlenecek verilerin örneğini gösterir:

- İlk 5 satır görüntülenir
- Eşleştirilen değişkenlerle sütun başlıkları
- Devam etmeden önce hizalamayı doğrula
- Ayarlamak için **Geri** tıklayın
- Toplu işleme başlamak için **Oluştur** tıklayın

#### Adım 4: Sertifika Oluşturma

İşlem başlar; gerçek zamanlı ilerleme görürsünüz:

```
Oluşturuluyor: [████████░░] 8/10 sertifika
⏱ Geçen: 12.5s
📊 Hız: ~0.8 sertifika/sn
```

**İşlem Sırasında:**
- Tarayıcıyı kapatmayın
- Sayfayı yenilemeyin
- İlerleme yüzdesini görebilirsiniz
- Tamamlamada toast bildirimleri

#### Adım 5: Sonuçları İndir

Tamamlandığında:
```
✓ 10 sertifika oluşturuldu
📦 certificator-batch-[timestamp].zip

[ZIP İndir]
```

**Dosya Yapısı:**
```
certificator-batch-2024-01-20_143022.zip
├── 001_Ahmet_Yilmaz.pdf
├── 002_Ayşe_Demir.pdf
├── 003_Mehmet_Kaya.pdf
└── ...
```

### Toplu Üretim İpuçları

**Dosya Boyutu Tahmini:**
- 10 sertifika ≈ 2-5 MB (resimlere bağlı)
- 100 sertifika ≈ 20-50 MB
- 1000 sertifika ≈ 200-500 MB

**Performans:**
- İşlem süresi ≈ sertifika başına 1-2 saniye
- 100 sertifika ≈ 2-3 dakika
- Dosya boyutlarını sertifika başına 5 MB altında tutun

**Karakter Kodlaması:**
- UTF-8 desteklenen (İngilizce, Türkçe, Çince, vb.)
- Özel karakterler: ü, ç, ş, ğ, ı → doğru işlenir
- Emoji: Önerilmez (PDF'de gösterilmeyebilir)

---

## Şablon Yönetimi

### Şablon Kaydetme

**Otomatik Kaydetme:**
**Kaydet** tıklattığınızda şablonlar tarayıcı depolamasına otomatik kaydedilir.

**Depolama Yeri:**
- Chrome/Edge/Firefox: Yerel depolama (5-50 MB sınırı)
- Şablonları tutmak için tarayıcı verilerini kaydedin

**Yedekleme Stratejisi:**
1. Düzenli şablonları JSON olarak **Dışa Aktar**
2. Yedekleri buluta kaydedin (Google Drive, OneDrive, vb.)
3. Büyük düzenlemelerden sonra dışa aktar

### Şablon Dışa Aktarma

**Tümünü Dışa Aktar:**
1. **Dashboard** → **Dışa Aktar** düğmesini tıklayın
2. `certificator-templates.json` dosyası indirilir
3. Tüm şablonları stilleriyle, fontlar ve elementleriyle içerir

**E-posta Yoluyla:**
- .json dosyasını meslektaşlarınızla paylaşın
- Onlar dashboard'larında **İçe Aktar** tıklatsınlar
- Şablonlar hemen görünecektir

### Şablon İçe Aktarma

**İçe Aktarma Süreci:**
1. **Dashboard** → **İçe Aktar** düğmesini tıklayın
2. .json dosyasını seçin (dışa aktarmadan veya meslektaştan)
3. Sistem mevcut şablonlarla birleştirir
4. Yinelenen ID'ler atlanır; yeni şablonlar eklenir

**Toplu İçe Aktarma:**
```
Buluttan indir
.json dosyalarını birer birer içe aktar
Şablon kütüphanelerini karıştırma ve eşleştir
```

### Ekiple Paylaşma

**Yöntem 1: Doğrudan Dışa Aktar/İçe Aktar**
```
Sen                Meslektaş
  ↓                  ↓
JSON Dışa Aktar   JSON İçe Aktar
  ↓                  ↓
E-posta Gönder    Yerel Kaydı
  ↓                  ↓
Şablonları anında alıyor
```

**Yöntem 2: Bulut Sinkronizasyonu (Önerilen)**
```
Sen                    Meslektaş
 ↓                        ↓
OneDrive Kaydet    OneDrive Senkronizasyonu
 ↓                        ↓
Tüm değişiklikler gerçek zamanlı senkronize edilir
```

---

## Klavye Kırpayları

### Canvas Gezinti
| Kırpay | İşlem |
|--------|-------|
| `Ctrl/Cmd + Kaydır` | Yakınlaştır/Uzaklaştır |
| `Space + Sürükle` | Canvas'ı kaydır |
| `Shift + Kaydır` | Yatay kaydır |

### Element Düzenleme
| Kırpay | İşlem |
|--------|-------|
| `Tıklama` | Element seç |
| `Shift + Tıklama` | Çoklu seç |
| `Ctrl/Cmd + A` | Tümünü seç (sınır hariç) |
| `Çift tıklama` | Satır içi metin düzenle |
| `Delete` / `Backspace` | Seçili sil |
| `Escape` | Seçimi kaldır |

### İşlemler
| Kırpay | İşlem |
|--------|-------|
| `Ctrl/Cmd + Z` | Geri Al |
| `Ctrl/Cmd + Y` | Yinele |
| `Ctrl/Cmd + Shift + Z` | Yinele (alternatif) |
| `Ctrl/Cmd + D` | Seçili çoğalt |
| `Ctrl/Cmd + C` | Seçili kopyala |
| `Ctrl/Cmd + V` | Yapıştır |

### Hareket
| Kırpay | İşlem |
|--------|-------|
| Ok tuşları | ±0.5% hareket |
| `Shift + Ok tuşu` | ±1.5% hareket |
| `Alt + Sürükle` | Mesafe rehberleri göster |

---

## Sorun Giderme

### Sık Sorunlar

#### "Dashboard 404 hatası gösteriyor"
**Çözüm:**
1. Sabit yenile: `Ctrl+Shift+R` (Windows) veya `Cmd+Shift+R` (Mac)
2. Tarayıcı önbelleğini temizle: Ayarlar → Gizlilik → Tarama verilerini temizle
3. Gizli/özel modu deneyin
4. Devam ederse, tarayıcı konsolunu kontrol edin (F12)

#### "Şablonlar yenileme sonrası görünmüyor"
**Çözüm:**
1. Tarayıcıda yerel depolamanın etkinleştirildiğini kontrol edin
2. DevTools (F12) → Application → Local Storage → "certificator" arayın
3. Boşsa, verileri silmeden önce şablonları dışa aktarın
4. Yedek JSON'dan geri yüklemek için İçe Aktar kullanın

#### "Metin editörde iyi görünüyor ama PDF'de kesilmiş"
**Çözüm:**
1. Metin element yüksekliğinin yeterli olduğunu kontrol edin
2. Font boyutunu küçültün (veya satır kırması kullanın)
3. Element sınırlarını büyütün
4. İndirmeden önce Canlı Önizleme kullanın
5. Düzenlenirken zoom %100 olduğunu doğrula

#### "Logo PDF'de pikselleşmiş görünüyor"
**Çözüm:**
1. Daha yüksek çözünürlüklü kaynak resmi kullanın (300+ DPI)
2. Veya editörde görüntü element boyutunu artırın
3. Görüntü formatını kontrol edin: PNG en iyi kalitedir
4. Düzenlerken uç zoom'u kullanmaktan kaçının (%100 kullanın)

#### "Toplu PDF oluşturma yavaş"
**Çözüm:**
1. Sertifikalardaki görüntü boyutunu azaltın (görüntüleri sıkıştırın)
2. Daha küçük toplu işlemleri işleyin (100-500 aynı anda)
3. Modern tarayıcı kullanın (Chrome/Firefox en hızlıdır)
4. RAM serbest bırakmak için diğer uygulamaları kapatın
5. Tarayıcı bellek sızıntısı varsa kontrol edin (>500MB ise yeniden başlatın)

#### "Dışa aktarılmış ZIP çok büyük"
**Çözüm:**
1. Şablon görüntü boyutlarını azaltın
2. Mümkün olan yerlerde 200×200px resimleri sıkıştırın
3. Kullanılmayan elementleri kaldırın
4. Veya daha küçük toplu işlemlerde işle (sertifika başına 50-100)

#### "Özel fontlar içe aktaramıyorum"
**Mevcut Sınırlama:**
- Yalnızca sistem fontları (Arial, Verdana, Georgia, Times, Courier)
- Özel fontlar v2.1+'da planlanmıştır

**Geçici Çözüm:**
- Yukarıda listelenen Web Güvenli fontları kullanın
- Veya metni yazı tipiyle önceden oluşturulmuş ResimElement olarak oluşturun (PNG/SVG)
- Logo resmini yazı tipiyle yükleyin

#### "1000+ sertifikada tarayıcı belleği tükeniyor"
**Çözüm:**
1. Daha küçük toplu işlemler oluşturun (maks 500)
2. İyi bellek yönetimi olan modern tarayıcı kullanın (Chrome)
3. Tarayıcı belleğini artırın: Mümkün değildir; başka cihaz kullanın
4. Kurumsal ölçekte sunucu taraflı oluşturmayı değerlendirin

### Yardım Alma

**Önce Bunları Kontrol Edin:**
1. [README.md](README.md) — Mimari genel bakış
2. [DEVELOPMENT.md](DEVELOPMENT.md) — Teknik kurulum
3. [EDITOR_CANVAS_GUIDE.md](EDITOR_CANVAS_GUIDE.md) — Canvas mekanikleri

**Sorun Bildir:**
- GitHub Sorunu aç:
  - Tarayıcı & sürüm
  - Hata mesajı (F12 konsolu)
  - Yeniden oluşturma adımları
  - Mümkünse ekran görüntüleri

---

## İpuçları & En İyi Uygulamalar

### Tasarım İpuçları
- Sans-serif fontlar kullanın (Arial, Verdana) netlik için
- Kenarlardan 0.5–1cm kenar boşluğu saklayın
- Birden fazla zoom seviyesinde test edin (%80, %100, %120)
- Elementler arasında tutarlı aralık kullanın
- Renk paletsini 3–4 ana renkle sınırlayın

### Performans
- En iyi hız için şablonları 5 elementten az tutun
- Arka plan resimlerini 500KB'ye sıkıştırın
- Logo yüklemelerini kaydetmeden önce toplu yapın
- Şablonları aylık olarak dışa aktarın

### Kalite Kontrolü
- İndirmeden önce her zaman Canlı Önizleme kullanın
- Toplu çalıştırmadan önce örnek verilerle test edin
- İlk 5 satırla sütun haritalamasını doğrula
- Özel karakterler (ü, ç, vb.) için alıcı adlarını kontrol edin

### Erişilebilirlik
- Yeterli renk kontrastı sağlayın (AA standardı)
- Okunabilir font boyutları kullanın (minimum 11pt)
- Önemli resimler için alt metin sağlayın
- Açık ve karanlık ortamlarda test edin

---

## Sık Sorulan Sorular (SSS)

**S: Kendi fontlarımı kullanabilir miyim?**
Y: Henüz değil. Şu anda sistem fontlarıyla sınırlıdır. v2.1 için planlanmıştır.

**S: Aynı anda kaç sertifika oluşturabilirim?**
Y: 5.000'e kadar test edilmiştir. Kararlılık için 500 toplu işlemler önerilir.

**S: Verilerim güvenli mi?**
Y: %100 — Her şey tarayıcınızda kalır. Sunuculara hiçbir şey gönderilmez.

**S: Oluşturulduktan sonra sertifikaları düzenleyebilir miyim?**
Y: Şablonu düzenleyin, ardından yeniden oluşturun. Bireysel PDF'ler doğrudan düzenlenemez.

**S: Logolar için boyut sınırı nedir?**
Y: Sabit sınırı yoktur, ancak her birini 1 MB altında tutun. Sıkıştırma önerilir.

**S: Bunu çevrimdışı kullanabilir miyim?**
Y: Evet, sayfayı bir kez yükledikten sonra. Tamamen çevrimdışı çalışır.

**S: Şablonlar ne kadar süre kaydedilir?**
Y: Tarayıcı depolaması temizlenene kadar. Kalıcı yedekleme için dışa aktarın.

**S: Birden fazla kişi aynı şablonu düzenleyebilir mi?**
Y: Hayır (henüz değil). Gerçek zamanlı işbirliği v2.2 için planlanmıştır.

**S: Herhangi bir veri toplayıyor musunuz?**
Y: Hayır. Bu gizlilik-first bir uygulamadır. Analitik veya izleme yok.

---

**Certificator'a Hoş Geldiniz!** 🎓

Bugün profesyonel sertifikalar oluşturmaya başlayın. Sorularınız mı var? GitHub'da bir sorun açın.

*Son güncelleme: Mart 2026*

# Certificator Windows Launcher

## Turkce / Turkish

### Ilk Kez Kurulum (Bir Kere)

1. **setup.bat** uzerine sag tiklayın
2. **"Run as Administrator"** secin
3. Bekleyin - kurulum otomatik yapilacak!

Setup otomatik yapar:
- Node.js kontrol eder, yoksa indir ve yükle
- npm kontrol eder
- Git kontrol eder (varsa)
- Python kontrol eder (varsa, backend için)
- Frontend paketlerini yükle (npm install)

### Uygulamayı Baslatma

**certificator-launcher.vbs** uzerine cift tikla

Ne olacak:
1. Uygulama bilgisi gosterilir
2. Sunucu baslatilir
3. Tarayici otomatik olarak acilir
4. http://localhost:3000 adresinde kullanilir

### Gereksinimler

- Windows 7, 8, 10 veya 11+
- Internet (ilk kurulum için indirme)

### Sorun Giderme

**"Node.js not found" hatası:**
- setup.bat dosyasini tekrar calistirin
- Yönetici olarak çalıştırmalısınız (sağ tık → Run as administrator)

**Port 3000 zaten kullaniliyor:**
- Baska bir uygulamayi kapayin veya portu degistirin

**Sunucu kapatma:**
- Terminal penceresinden Ctrl+C tusuna basin
- Ya da pencereyi kapatin

---

## English Version

### First Time Setup (One Time)

1. Right-click on **setup.bat**
2. Select **"Run as Administrator"**
3. Wait - setup runs automatically!

Setup will:
- Check Node.js, download and install if needed
- Check npm
- Check Git (if installed)
- Check Python (if installed, for backend)
- Install frontend packages (npm install)

### Starting the App

Double-click **certificator-launcher.vbs**

What happens:
1. App info is displayed
2. Server starts
3. Browser opens automatically
4. Use at http://localhost:3000

### Requirements

- Windows 7, 8, 10 or 11+
- Internet connection (for first setup)

### Troubleshooting

**"Node.js not found" error:**
- Run setup.bat again
- Must run as Administrator (right-click → Run as administrator)

**Port 3000 already in use:**
- Close another application or change port

**Stopping the server:**
- Press Ctrl+C in the terminal window
- Or close the window directly

---

## Files

| File | What it does |
|------|------|
| `setup.bat` | Setup installer - run once as Administrator |
| `certificator-launcher.vbs` | App launcher - double-click to start |

---

**Done! / Hazir! Enjoy / Keyif alın! 🎉**

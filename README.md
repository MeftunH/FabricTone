# FabricTone / Kumaş Tonu Karşılaştırıcı

A modern web application for comparing colors between two regions of fabric using camera capture. / Kamera kullanarak iki farklı kumaş bölgesinin renklerini karşılaştırmak için modern bir web uygulaması.

## Features / Özellikler

- Camera-based image capture for fabric analysis / Kumaş analizi için kamera ile görüntü yakalama
- Interactive region selection for color comparison / Renk karşılaştırması için etkileşimli bölge seçimi
- Color difference calculation using the CIEDE2000 Delta-E metric / CIEDE2000 Delta-E metrikleri ile renk farkı hesaplama
- Modern, responsive user interface / Modern, duyarlı kullanıcı arayüzü
- No server-side image storage for privacy / Gizlilik için sunucu tarafında görüntü depolama yok

## Technical Details / Teknik Detaylar

- Built with Flask (Python) / Flask (Python) ile oluşturuldu
- Uses OpenCV and scikit-image for color processing / Renk işleme için OpenCV ve scikit-image kullanır
- Front-end with modern JavaScript, HTML5 and CSS3 / Modern JavaScript, HTML5 ve CSS3 ile ön yüz
- Camera API for direct image capture / Doğrudan görüntü yakalama için Kamera API'si

## Deployment / Dağıtım

### Local Development / Yerel Geliştirme

1. Clone the repository / Depoyu klonlayın:
   ```
   git clone https://github.com/yourusername/FabricTone.git
   cd FabricTone
   ```
2. Install dependencies / Bağımlılıkları yükleyin:
   ```
   pip install -r requirements.txt
   ```
3. Run the application / Uygulamayı çalıştırın:
   ```
   python app.py
   ```
4. Access at / Şu adresten erişin: http://localhost:5001

### Production Deployment / Canlıya Alma

#### Render.com Deployment / Render.com'a Dağıtım

1. Create a new Web Service on Render.com / Render.com'da yeni bir Web Servisi oluşturun
2. Connect your GitHub repository / GitHub deponuzu bağlayın
3. Configure the deployment settings / Dağıtım ayarlarını yapılandırın:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment Variables / Ortam Değişkenleri**:
     - `PYTHON_VERSION`: `3.9.0`
4. Click "Create Web Service" / "Web Servisi Oluştur"a tıklayın

#### Required Files / Gerekli Dosyalar

- `requirements.txt` (with all dependencies including gunicorn) / (gunicorn dahil tüm bağımlılıklarla birlikte)
- `Procfile` (with the command: `web: gunicorn app:app`)
- `wsgi.py` (entry point for gunicorn) / (gunicorn için giriş noktası)

## Note / Not

This application requires camera access, which browsers only allow on secure origins (HTTPS) or localhost during development. / Bu uygulama kamera erişimi gerektirir, tarayıcılar bunu sadece güvenli kökenlerde (HTTPS) veya geliştirme sırasında localhost'ta izin verir.

## Support / Destek

For support, please open an issue in the GitHub repository. / Destek için lütfen GitHub deposunda bir konu açın.

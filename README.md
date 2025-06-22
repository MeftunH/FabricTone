# FabricTone

A modern web application for comparing colors between two regions of fabric using camera capture.

## Features

- Camera-based image capture for fabric analysis
- Interactive region selection for color comparison
- Color difference calculation using CIEDE2000 Delta-E metric
- Responsive user interface
- Client-side processing for privacy

## Technical Stack

- **Backend**: Python Flask
- **Computer Vision**: OpenCV, scikit-image
- **Frontend**: HTML5, CSS3, JavaScript
- **API**: Camera API for image capture

## Local Development

### Prerequisites

- Python 3.9+
- pip (Python package manager)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/FabricTone.git
   cd FabricTone
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On macOS/Linux: source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5001
   ```

## Production Deployment

### Render.com

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure deployment settings:
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment Variables**:
     - `PYTHON_VERSION`: `3.9.0`

## Required Files

### requirements.txt
```
Flask==2.0.1
opencv-python-headless==4.5.3.56
scikit-image==0.18.3
numpy>=1.19.2
gunicorn==20.1.0
```

### Procfile
```
web: gunicorn app:app
```

### wsgi.py
```python
from app import app

if __name__ == "__main__":
    app.run()
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

**Note**: HTTPS is required for camera access in production environments.

## Support

For issues and feature requests, please use the [issue tracker](https://github.com/yourusername/FabricTone/issues).

## License

[Your License Here]

# FabricTone

A modern web application for comparing colors between two regions of fabric using camera capture.

## Features

- Camera-based image capture for fabric analysis
- Interactive region selection for color comparison
- Color difference calculation using the CIEDE2000 Delta-E metric
- Modern, responsive user interface
- No server-side image storage for privacy

## Technical Details

- Built with Flask (Python)
- Uses OpenCV and scikit-image for color processing
- Front-end with modern JavaScript, HTML5 and CSS3
- Camera API for direct image capture

## Deployment

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python app.py
   ```
4. Access at http://localhost:5001

### Production Deployment

This application is configured for deployment on platforms like Heroku:

1. Make sure you have the required files:
   - requirements.txt
   - Procfile
   - wsgi.py

2. Deploy to your platform of choice that supports Python web applications.

## Note

This application requires camera access, which browsers only allow on secure origins (HTTPS) or localhost during development.

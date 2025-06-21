import os
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, url_for, flash, redirect
from werkzeug.utils import secure_filename
from skimage.color import rgb2lab, deltaE_ciede2000

app = Flask(__name__)
app.secret_key = 'fabric_tone_matching_secret_key'
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Folder yaratmaq
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def compare_colors(image_path, region1, region2):
    """İki bölgənin rəng müqayisəsi"""
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Bölgələri koordinatlara görə kəsmək
    region1_img = img[region1[1]:region1[3], region1[0]:region1[2]]
    region2_img = img[region2[1]:region2[3], region2[0]:region2[2]]
    
    # Ortalama rəng hesablamaq
    avg_color1 = np.mean(region1_img.reshape(-1, 3), axis=0)
    avg_color2 = np.mean(region2_img.reshape(-1, 3), axis=0)
    
    # RGB-dən LAB-a çevirmək
    lab_color1 = rgb2lab([[avg_color1]])[0][0]
    lab_color2 = rgb2lab([[avg_color2]])[0][0]
    
    # CIEDE2000 Delta-E hesablamaq (rəng fərqi)
    delta_e = deltaE_ciede2000(lab_color1.reshape(1, 3), lab_color2.reshape(1, 3))[0][0]
    
    threshold = 5.0  # Rəng fərqi üçün eşik dəyəri
    is_match = delta_e < threshold
    
    return {
        'is_match': bool(is_match),
        'delta_e': float(delta_e),
        'avg_color1': [int(c) for c in avg_color1],
        'avg_color2': [int(c) for c in avg_color2]
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('Fayl seçilməyib')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('Fayl seçilməyib')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        return redirect(url_for('select_regions', filename=filename))
    
    flash('İcazə verilən fayl formatları: png, jpg, jpeg')
    return redirect(request.url)


@app.route('/select_regions/<filename>')
def select_regions(filename):
    return render_template('select_regions.html', filename=filename)


@app.route('/compare', methods=['POST'])
def compare():
    data = request.get_json()
    filename = data.get('filename')
    region1 = data.get('region1')  # [x1, y1, x2, y2] format
    region2 = data.get('region2')  # [x1, y1, x2, y2] format
    
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Fayl tapılmadı'}), 404
    
    result = compare_colors(filepath, region1, region2)
    
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)

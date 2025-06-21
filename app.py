import os
import cv2
import numpy as np
import base64
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from skimage.color import rgb2lab, deltaE_ciede2000
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'fabric_tone_matching_secret_key'

# Only needed for debugging and should be removed in production
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

def compare_colors_from_image(img_array, region1, region2):
    """İki bölgənin rəng müqayisəsi indi numpy array üzərində işləyir"""
    # Ensure the image is in RGB format (it might be BGR from OpenCV)
    if img_array.shape[2] == 3:  # If it has 3 channels, assume BGR and convert to RGB
        img_array = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
    
    # Bölgələri koordinatlara görə kəsmək
    region1_img = img_array[region1[1]:region1[3], region1[0]:region1[2]]
    region2_img = img_array[region2[1]:region2[3], region2[0]:region2[2]]
    
    # Ortalama rəng hesablamaq - median istifadə edəcəyik ki, kənar dəyərlər təsir etməsin
    # Mean yerine median istifadə etmək kənar dəyərlərə (aşırı işıqlı/qaranlıq piksellərə) qarşı daha dayanıqlıdır
    avg_color1 = np.median(region1_img.reshape(-1, 3), axis=0)
    avg_color2 = np.median(region2_img.reshape(-1, 3), axis=0)
    
    # RGB-dən LAB-a çevirmək
    lab_color1 = rgb2lab([[avg_color1]])[0][0]
    lab_color2 = rgb2lab([[avg_color2]])[0][0]
    
    # CIEDE2000 Delta-E hesablamaq (rəng fərqi)
    result = deltaE_ciede2000(lab_color1.reshape(1, 3), lab_color2.reshape(1, 3))
    
    # Handle the result safely regardless of whether it's a scalar or array
    if isinstance(result, np.ndarray):
        if result.size == 1:  # Single element array
            delta_e = float(result.item())
        else:
            # If it's a multi-dimensional array, get the first element
            try:
                delta_e = float(result[0][0])
            except (IndexError, TypeError):
                delta_e = float(result.flatten()[0])
    else:
        # It's already a scalar
        delta_e = float(result)
    
    # Eyni parçada ola biləcək təbii fərqlər üçün daha yüksək eşik dəyəri
    threshold = 15.0  # Eyni rəngli parçalar üçün daha liberal dəyər
    is_match = delta_e < threshold
    
    return {
        'is_match': bool(is_match),
        'delta_e': float(delta_e),
        'avg_color1': [int(c) for c in avg_color1],
        'avg_color2': [int(c) for c in avg_color2]
    }


@app.route('/')
def index():
    """Main page with camera capture UI"""
    return render_template('index.html')


@app.route('/compare_regions', methods=['POST'])
def compare_regions():
    """Compare two regions in an image captured directly from the camera"""
    # Check if image exists in the request
    if 'image' not in request.files:
        return jsonify({'error': 'Şəkil tapılmadı'}), 400
    
    # Get the image file from the request
    image_file = request.files['image']
    
    # Parse region coordinates from the request
    try:
        region1 = json.loads(request.form.get('region1'))
        region2 = json.loads(request.form.get('region2'))
    except Exception as e:
        return jsonify({'error': 'Bölgə koordinatları düzgün formatda deyil'}), 400
    
    # Read the image data into memory
    image_data = image_file.read()
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return jsonify({'error': 'Şəkil oxuna bilmədi'}), 400
    
    # Process the image
    try:
        result = compare_colors_from_image(img, region1, region2)
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error processing image: {str(e)}")
        return jsonify({'error': 'Şəklin emalında xəta baş verdi'}), 500


# Debug route to check if the server is running
@app.route('/health')
def health_check():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    # Import JSON module only needed here
    import json
    # Run the application
    app.run(debug=True, port=5001)

document.addEventListener('DOMContentLoaded', function() {
    // Step elements
    const captureStep = document.getElementById('captureStep');
    const selectionStep = document.getElementById('selectionStep');
    const resultStep = document.getElementById('resultStep');

    // Camera elements
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const snapBtn = document.getElementById('snapBtn');
    const cancelCameraBtn = document.getElementById('cancelCameraBtn');
    const cameraOverlay = document.getElementById('cameraOverlay');

    // Selection elements
    const capturedImage = document.getElementById('capturedImage');
    const newCaptureBtn = document.getElementById('newCaptureBtn');

    // Result elements
    const tryAgainBtn = document.getElementById('tryAgainBtn');

    let stream = null;
    let capturedImageData = null;
    
    // Navigation between steps
    function showStep(stepElement) {
        // Hide all steps
        [captureStep, selectionStep, resultStep].forEach(step => {
            step.classList.remove('active');
        });

        // Show the requested step
        stepElement.classList.add('active');
    }

    // Initialize camera with better settings for color accuracy
    function startCamera() {
        const constraints = { 
            video: { 
                facingMode: 'environment',  // Use back camera if available
                width: { ideal: 1280 },     // Higher resolution for better color accuracy
                height: { ideal: 720 },
                // Request better color settings if available
                whiteBalanceMode: { ideal: 'continuous' },
                exposureMode: { ideal: 'continuous' }
            } 
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(mediaStream) {
                stream = mediaStream;
                video.srcObject = mediaStream;
                video.play();
                
                // Show camera UI elements
                snapBtn.classList.remove('d-none');
                cancelCameraBtn.classList.remove('d-none');
                startCameraBtn.classList.add('d-none');
                cameraOverlay.classList.remove('d-none');
            })
            .catch(function(err) {
                console.error("Kamera xətası: ", err);
                alert("Kameraya giriş mümkün olmadı. Zəhmət olmasa icazələri yoxlayın.");
            });
    }

    // Stop camera stream
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            
            // Reset camera UI
            snapBtn.classList.add('d-none');
            cancelCameraBtn.classList.add('d-none');
            startCameraBtn.classList.remove('d-none');
            cameraOverlay.classList.add('d-none');
        }
    }

    // Take a photo from the camera
    function takePhoto() {
        if (!stream) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data as base64 for display
        capturedImageData = canvas.toDataURL('image/jpeg', 0.95);
        
        // Set the image source and move to selection step
        capturedImage.src = capturedImageData;
        stopCamera();
        showStep(selectionStep);

        // Initialize the region selection
        initRegionSelection();
    }

    // Initialize region selection (will be implemented in region_selector.js)
    function initRegionSelection() {
        // Reset selection boxes
        if (window.resetSelections && typeof window.resetSelections === 'function') {
            window.resetSelections();
        }
    }

    // Event listeners
    startCameraBtn.addEventListener('click', startCamera);
    cancelCameraBtn.addEventListener('click', stopCamera);
    snapBtn.addEventListener('click', takePhoto);
    
    // Handle going back to camera from selection
    newCaptureBtn.addEventListener('click', function() {
        showStep(captureStep);
    });
    
    // Try again from results
    tryAgainBtn.addEventListener('click', function() {
        showStep(captureStep);
    });

    // Clean up when navigating away
    window.addEventListener('beforeunload', stopCamera);

    // Expose functions to be used by region_selector.js
    window.showResultStep = function() {
        showStep(resultStep);
    };

    // Make captured image data available to other scripts
    window.getCapturedImageBlob = function(callback) {
        if (!capturedImageData) return;
        
        // Convert the base64 data to a blob
        fetch(capturedImageData)
            .then(res => res.blob())
            .then(blob => {
                callback(blob);
            })
            .catch(err => {
                console.error('Error converting image data:', err);
            });
    };
});


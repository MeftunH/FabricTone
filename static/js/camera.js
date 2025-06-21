document.addEventListener('DOMContentLoaded', function() {
    const captureBtn = document.getElementById('captureBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const snapBtn = document.getElementById('snapBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const fileInput = document.getElementById('file');
    
    let stream = null;
    
    // Function to start camera
    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(mediaStream) {
                stream = mediaStream;
                video.srcObject = mediaStream;
                cameraContainer.classList.remove('d-none');
                snapBtn.disabled = false;
            })
            .catch(function(err) {
                console.error("Kamera xətası: ", err);
                alert("Kameraya giriş mümkün olmadı. Zəhmət olmasa icazələri yoxlayın və ya fayl yükləyin.");
            });
    }
    
    // Function to stop camera
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            cameraContainer.classList.add('d-none');
        }
    }
    
    // Start camera when capture button is clicked
    captureBtn.addEventListener('click', function() {
        startCamera();
    });
    
    // Cancel camera capture
    cancelBtn.addEventListener('click', function() {
        stopCamera();
    });
    
    // Take snapshot and convert to file
    snapBtn.addEventListener('click', function() {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(function(blob) {
            // Create a File object
            const capturedImage = new File([blob], "camera_capture.jpg", {
                type: "image/jpeg",
                lastModified: new Date().getTime()
            });
            
            // Create a new FileList object to assign to the file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(capturedImage);
            fileInput.files = dataTransfer.files;
            
            // Stop the camera
            stopCamera();
            
            // Automatically submit the form
            fileInput.form.submit();
        }, 'image/jpeg', 0.95);
    });
    
    // Stop camera when page is closed/changed
    window.addEventListener('beforeunload', function() {
        stopCamera();
    });
});

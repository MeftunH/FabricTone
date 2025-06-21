document.addEventListener('DOMContentLoaded', function() {
    // Selection elements
    const capturedImage = document.getElementById('capturedImage');
    const selection1 = document.getElementById('selection1');
    const selection2 = document.getElementById('selection2');
    const resetSelectionsBtn = document.getElementById('resetSelectionsBtn');
    const compareBtn = document.getElementById('compareBtn');
    
    // Result elements
    const resultContent = document.getElementById('resultContent');
    const color1Sample = document.getElementById('color1Sample');
    const color2Sample = document.getElementById('color2Sample');
    const deltaEValue = document.getElementById('deltaEValue');
    
    // Selection variables
    const BOX_SIZE = 60; // Smaller selection box size (60x60 pixels)
    let selectionNumber = 1;
    let region1Coords = null;
    let region2Coords = null;
    let capturedImageBlob = null;
    
    // Place selection box on image
    function placeSelectionBox(e) {
        if (selectionNumber > 2) return;
        
        const rect = capturedImage.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        let clickY = e.clientY - rect.top;
        
        // Keep within image boundaries
        clickX = Math.max(BOX_SIZE/2, Math.min(rect.width - BOX_SIZE/2, clickX));
        clickY = Math.max(BOX_SIZE/2, Math.min(rect.height - BOX_SIZE/2, clickY));
        
        // Calculate box coordinates
        const left = clickX - BOX_SIZE/2;
        const top = clickY - BOX_SIZE/2;
        
        // Show selection box
        const currentSelection = selectionNumber === 1 ? selection1 : selection2;
        currentSelection.style.left = left + 'px';
        currentSelection.style.top = top + 'px';
        currentSelection.style.width = BOX_SIZE + 'px';
        currentSelection.style.height = BOX_SIZE + 'px';
        currentSelection.style.display = 'block';
        
        // Store coordinates
        const region = [
            Math.round(left),
            Math.round(top),
            Math.round(left + BOX_SIZE),
            Math.round(top + BOX_SIZE)
        ];
        
        // Set selection region
        if (selectionNumber === 1) {
            region1Coords = region;
            selectionNumber = 2;
            showToast('Birinci bölgə seçildi! İndi ikinci bölgəni seçin.');
        } else {
            region2Coords = region;
            selectionNumber = 3; // Both regions selected
            compareBtn.disabled = false;
            showToast('İkinci bölgə seçildi! İndi "Müqayisə Et" düyməsinə klikləyin.');
        }
    }
    
    // Reset selections function
    function resetSelections() {
        selection1.style.display = 'none';
        selection2.style.display = 'none';
        region1Coords = null;
        region2Coords = null;
        selectionNumber = 1;
        compareBtn.disabled = true;
    }
    
    // Show a toast notification instead of an alert
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Compare the selected regions
    function compareRegions() {
        if (!region1Coords || !region2Coords) return;
        
        // Get the captured image as blob
        window.getCapturedImageBlob(function(blob) {
            // Create form data with the image blob
            const formData = new FormData();
            formData.append('image', blob, 'camera_capture.jpg');
            formData.append('region1', JSON.stringify(region1Coords));
            formData.append('region2', JSON.stringify(region2Coords));
            
            // Send to server for processing
            fetch('/compare_regions', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Display results
                const rgb1 = data.avg_color1;
                const rgb2 = data.avg_color2;
                
                // Set color samples
                color1Sample.style.backgroundColor = `rgb(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]})`;
                color2Sample.style.backgroundColor = `rgb(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]})`;
                
                // Set delta E value
                deltaEValue.textContent = data.delta_e.toFixed(2);
                
                // Show match result
                if (data.is_match) {
                    resultContent.textContent = 'Bu parçalar eyni rəngdədir!';
                    resultContent.classList.add('match');
                    resultContent.classList.remove('no-match');
                } else {
                    resultContent.textContent = 'Bu parçalar fərqli rəngdədir!';
                    resultContent.classList.add('no-match');
                    resultContent.classList.remove('match');
                }
                
                // Show the results step
                if (window.showResultStep) {
                    window.showResultStep();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
            });
        });
    }
    
    // Event listeners
    resetSelectionsBtn.addEventListener('click', resetSelections);
    compareBtn.addEventListener('click', compareRegions);
    
    // Image click events
    capturedImage.addEventListener('click', placeSelectionBox);
    
    // Mobile support
    capturedImage.addEventListener('touchend', function(e) {
        e.preventDefault();
        placeSelectionBox({
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        });
    });
    
    // Show initial guidance after a short delay
    setTimeout(function() {
        showToast('Birinci parça bölgəsini seçmək üçün şəkil üzərində klikləyin.');
    }, 1000);
    
    // Make reset function available to camera.js
    window.resetSelections = resetSelections;
    
    // Add toast style to document if it doesn't exist
    if (!document.getElementById('toastStyle')) {
        const style = document.createElement('style');
        style.id = 'toastStyle';
        style.textContent = `
            .toast-message {
                position: fixed;
                top: 30px;
                right: 30px;
                transform: translateX(120%);
                background-color: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 1000;
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                text-align: left;
                max-width: 350px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                border-left: 4px solid var(--accent-color);
            }
            .toast-message.show {
                transform: translateX(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const fabricImage = document.getElementById('fabricImage');
    const selection1 = document.getElementById('selection1');
    const selection2 = document.getElementById('selection2');
    const resetBtn = document.getElementById('resetBtn');
    const compareBtn = document.getElementById('compareBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const color1Sample = document.getElementById('color1Sample');
    const color2Sample = document.getElementById('color2Sample');
    const deltaEValue = document.getElementById('deltaEValue');
    
    let isSelecting = false;
    let selectionNumber = 1;
    let startX, startY;
    
    let region1Coords = null;
    let region2Coords = null;

    // Get the filename from the URL
    const imagePath = fabricImage.src;
    const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    
    // Function to handle mouse down
    function handleMouseDown(e) {
        if (selectionNumber > 2) return;
        
        isSelecting = true;
        const rect = fabricImage.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        // Reset the current selection box
        const currentSelection = selectionNumber === 1 ? selection1 : selection2;
        currentSelection.style.left = startX + 'px';
        currentSelection.style.top = startY + 'px';
        currentSelection.style.width = '0';
        currentSelection.style.height = '0';
        currentSelection.style.display = 'block';
    }
    
    // Function to handle mouse move
    function handleMouseMove(e) {
        if (!isSelecting) return;
        
        const rect = fabricImage.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // Calculate dimensions for the selection box
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);
        
        // Update the selection box dimensions
        const currentSelection = selectionNumber === 1 ? selection1 : selection2;
        currentSelection.style.left = left + 'px';
        currentSelection.style.top = top + 'px';
        currentSelection.style.width = width + 'px';
        currentSelection.style.height = height + 'px';
    }
    
    // Function to handle mouse up
    function handleMouseUp(e) {
        if (!isSelecting) return;
        
        isSelecting = false;
        
        const rect = fabricImage.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // Calculate the final dimensions
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        // Minimum size check (20x20 pixels)
        if (width < 20 || height < 20) {
            const currentSelection = selectionNumber === 1 ? selection1 : selection2;
            currentSelection.style.display = 'none';
            return;
        }
        
        // Store the coordinates
        const region = [
            Math.round(left),
            Math.round(top),
            Math.round(left + width),
            Math.round(top + height)
        ];
        
        if (selectionNumber === 1) {
            region1Coords = region;
            selectionNumber = 2;
        } else {
            region2Coords = region;
            selectionNumber = 3; // Both regions selected
            compareBtn.disabled = false;
        }
    }
    
    // Reset selections
    resetBtn.addEventListener('click', function() {
        selection1.style.display = 'none';
        selection2.style.display = 'none';
        region1Coords = null;
        region2Coords = null;
        selectionNumber = 1;
        compareBtn.disabled = true;
        resultContainer.style.display = 'none';
    });
    
    // Compare regions
    compareBtn.addEventListener('click', function() {
        if (!region1Coords || !region2Coords) return;
        
        // Send data to server
        fetch('/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: filename,
                region1: region1Coords,
                region2: region2Coords
            })
        })
        .then(response => response.json())
        .then(data => {
            // Display results
            resultContainer.style.display = 'block';
            
            // Set color samples
            const rgb1 = data.avg_color1;
            const rgb2 = data.avg_color2;
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
            
            // Scroll to result
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
        });
    });
    
    // Setup event listeners
    fabricImage.addEventListener('mousedown', handleMouseDown);
    fabricImage.addEventListener('mousemove', handleMouseMove);
    fabricImage.addEventListener('mouseup', handleMouseUp);
    
    // Add touch support for mobile devices
    fabricImage.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        e.preventDefault();
    });
    
    fabricImage.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        e.preventDefault();
    });
    
    fabricImage.addEventListener('touchend', function(e) {
        handleMouseUp({
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        });
        e.preventDefault();
    });
});

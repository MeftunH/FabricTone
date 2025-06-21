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
    
    // Avtomatik ölçülü seçim qutuları yaratmaq
    const BOX_SIZE = 100; // Sabit qutu ölçüsü (100x100 piksel)
    let selectionNumber = 1;
    let region1Coords = null;
    let region2Coords = null;

    // Get the filename from the URL
    const imagePath = fabricImage.src;
    const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    
    // Seçim qutusunu yerləşdirmək üçün funksiya
    function placeSelectionBox(e) {
        if (selectionNumber > 2) return;
        
        const rect = fabricImage.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        let clickY = e.clientY - rect.top;
        
        // Şəklin sərhədləri daxilində qalmaq
        clickX = Math.max(BOX_SIZE/2, Math.min(rect.width - BOX_SIZE/2, clickX));
        clickY = Math.max(BOX_SIZE/2, Math.min(rect.height - BOX_SIZE/2, clickY));
        
        // Qutu koordinatlarını hesablamaq
        const left = clickX - BOX_SIZE/2;
        const top = clickY - BOX_SIZE/2;
        
        // Seçim qutusunu göstərmək
        const currentSelection = selectionNumber === 1 ? selection1 : selection2;
        currentSelection.style.left = left + 'px';
        currentSelection.style.top = top + 'px';
        currentSelection.style.width = BOX_SIZE + 'px';
        currentSelection.style.height = BOX_SIZE + 'px';
        currentSelection.style.display = 'block';
        
        // Koordinatları saxlamaq
        const region = [
            Math.round(left),
            Math.round(top),
            Math.round(left + BOX_SIZE),
            Math.round(top + BOX_SIZE)
        ];
        
        // Seçimi qeyd etmək
        if (selectionNumber === 1) {
            region1Coords = region;
            selectionNumber = 2;
            alert('Birinci parça bölgəsi seçildi! İndi ikinci parça bölgəsini seçin.');
        } else {
            region2Coords = region;
            selectionNumber = 3; // Hər iki bölgə seçildi
            compareBtn.disabled = false;
            alert('İkinci parça bölgəsi seçildi! İndi "Müqayisə Et" düyməsinə klikləyin.');
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
        alert('Seçimlər sıfırlandı. Yenidən birinci parça bölgəsini seçin.');
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
    
    // Şəkil üzərində klik hadisəsi
    fabricImage.addEventListener('click', placeSelectionBox);
    
    // Mobil cihazlar üçün dəstək
    fabricImage.addEventListener('touchend', function(e) {
        e.preventDefault();
        placeSelectionBox({
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
        });
    });
    
    // Başlanğıcda istifadəçiyə yol göstərmək
    setTimeout(function() {
        alert('Birinci parça bölgəsini seçmək üçün şəkil üzərində klikləyin. Avtomatik olaraq 100x100 piksel bölgə seçiləcək.');
    }, 1000);
});

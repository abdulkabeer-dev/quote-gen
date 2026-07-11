/* ============================================
   DEVI ADS Invoice System v2.0
   Digital Signature Upload & Persistence
   ============================================ */

/**
 * Handle signature image upload
 * @param {Event} event - File input change event
 */
function handleSignatureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showError('Please select a PNG or JPG image file.');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showError('Signature file must be less than 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedSignature = e.target.result;
        saveSignatureToStorage(e.target.result);
        displaySignaturePreview(e.target.result);
        showSuccess('Signature uploaded and saved!', 2000);
    };
    reader.onerror = function () {
        showError('Error reading signature file.');
    };
    reader.readAsDataURL(file);
}

/**
 * Save signature to localStorage for permanent storage
 * @param {string} dataUrl - Base64 encoded image
 */
function saveSignatureToStorage(dataUrl) {
    try {
        localStorage.setItem('billingSignature', dataUrl);
    } catch (error) {
        console.error('Error saving signature:', error);
        showError('Could not save signature permanently. Storage may be full.');
    }
}

/**
 * Load signature from localStorage on page load
 */
function loadSignature() {
    try {
        const saved = localStorage.getItem('billingSignature');
        if (saved) {
            uploadedSignature = saved;
            displaySignaturePreview(saved);
        }
        
        const savedScale = localStorage.getItem('billingSignatureScale');
        if (savedScale) {
            uploadedSignatureScale = parseFloat(savedScale);
            const slider = document.getElementById('signatureScale');
            if (slider) {
                slider.value = savedScale;
                updateSignatureScaleDisplay(savedScale, false); // false to not write back to local storage during load
            }
        }

        const savedEnabled = localStorage.getItem('billingSignatureEnabled');
        if (savedEnabled !== null) {
            const sigToggle = document.getElementById('signatureEnabled');
            if (sigToggle) {
                sigToggle.checked = savedEnabled === 'true';
            }
        }
    } catch (error) {
        console.error('Error loading signature/scale:', error);
    }
}

/**
 * Display signature preview in the upload area
 * @param {string} imageSrc - Base64 image source
 */
function displaySignaturePreview(imageSrc) {
    const container = document.getElementById('signatureContent');
    const removeBtn = document.getElementById('removeSignatureBtn');

    container.innerHTML = `
        <img src="${imageSrc}" alt="Signature" class="signature-preview-img" />
        <p style="margin-top: 4px; color: var(--gray-600); font-size: 11px; text-align: center;">
            Click to change signature
        </p>
    `;

    if (removeBtn) {
        removeBtn.style.display = 'inline-flex';
    }
}

/**
 * Remove saved signature
 */
function removeSignature() {
    if (confirm('Are you sure you want to remove the saved signature?')) {
        uploadedSignature = null;
        localStorage.removeItem('billingSignature');

        const container = document.getElementById('signatureContent');
        container.innerHTML = `
            <span class="material-icons" style="font-size: 36px; color: var(--gray-400);">draw</span>
            <p style="margin-top: 8px; color: var(--gray-600); font-size: 12px; text-align: center;">
                Click to upload signature (PNG/JPG)
            </p>
        `;

        const removeBtn = document.getElementById('removeSignatureBtn');
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }

        showSuccess('Signature removed.', 2000);
    }
}

/**
 * Update signature scale value and update preview instantly
 * @param {string|number} val
 * @param {boolean} writeStorage - Save to localStorage
 */
function updateSignatureScaleDisplay(val, writeStorage = true) {
    const scale = parseFloat(val) || 1.0;
    uploadedSignatureScale = scale;
    
    const display = document.getElementById('signatureScaleDisplay');
    if (display) {
        display.textContent = `Scale: ${scale.toFixed(1)}x ${scale === 1.0 ? '(Default)' : ''}`;
    }
    
    if (writeStorage) {
        try {
            localStorage.setItem('billingSignatureScale', val);
        } catch (e) {
            console.error('Error saving signature scale:', e);
        }
    }
    
    // Dynamically adjust preview signature scale if it's currently rendered
    const previewSigImage = document.querySelector('#previewSignature img');
    if (previewSigImage) {
        const sigHeight = 100 * scale;
        const sigWidth = 300 * scale;
        previewSigImage.style.maxHeight = `${sigHeight}px`;
        previewSigImage.style.maxWidth = `${sigWidth}px`;
    }
}

/**
 * Toggle signature visibility in preview and save status
 */
function toggleSignature() {
    const sigToggle = document.getElementById('signatureEnabled');
    if (sigToggle) {
        const enabled = sigToggle.checked;
        localStorage.setItem('billingSignatureEnabled', enabled);
        collectInvoiceData();
        populatePreview();
    }
}

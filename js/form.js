/* ============================================
   DEVI ADS Invoice System v2.0
   Form Handling, Logo, Validation, Template, Font Controls
   ============================================ */

// === LOGO UPLOAD ===
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showError('Please select an image file only.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedLogoFile = e.target.result;
        displayLogo(e.target.result);
        showSuccess('Logo uploaded successfully!', 2000);
    };
    reader.onerror = function () {
        showError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
}

function displayLogo(imageSrc) {
    const logoContent = document.getElementById('logoContent');
    logoContent.innerHTML = `
        <img src="${imageSrc}" alt="Company Logo" class="logo-preview" />
        <p style="margin-top: 8px; color: var(--gray-600); font-size: 12px; text-align: center;">
            Click to change logo
        </p>
    `;
}

// === FORM VALIDATION ===
function validateForm() {
    const requiredFields = [
        { id: 'customerName', name: 'Customer Name' },
        { id: 'customerMobile', name: 'Mobile Number' },
        { id: 'invoiceDate', name: 'Invoice Date' }
    ];

    for (let field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element.value.trim()) {
            showError(`${field.name} is required.`);
            element.focus();
            return false;
        }
    }

    // Check at least one product row has valid data
    const rows = document.querySelectorAll('#productTableBody .table-row');
    let hasValidProduct = false;

    for (let row of rows) {
        const town = row.querySelector('.town-input')?.value.trim();
        const location = row.querySelector('.location-input')?.value.trim();
        const amount = parseFloat(row.querySelector('.amount-input')?.value) || 0;

        if ((town || location) && amount > 0) {
            hasValidProduct = true;
            break;
        }
    }

    // Also check service charges
    const serviceRows = document.querySelectorAll('#serviceTableBody .table-row');
    let hasServiceCharge = false;
    for (let row of serviceRows) {
        const name = row.querySelector('.service-name-input')?.value.trim();
        const amount = parseFloat(row.querySelector('.service-amount-input')?.value) || 0;
        if (name && amount > 0) {
            hasServiceCharge = true;
            break;
        }
    }

    if (!hasValidProduct && !hasServiceCharge) {
        showError('Please add at least one product entry or service charge with a valid amount.');
        return false;
    }

    return true;
}

// === RESET FORM ===
function resetForm() {
    if (confirm('Are you sure you want to reset the entire form? All data except saved notes and signature will be lost.')) {
        // Clear all form inputs except specific ones
        document.querySelectorAll('.form-input').forEach(input => {
            if (!['invoiceId'].includes(input.id)) {
                input.value = '';
            }
        });

        document.getElementById('sgstRate').value = '9';
        document.getElementById('cgstRate').value = '9';
        document.getElementById('gstEnabled').checked = true;

        uploadedLogoFile = null;
        document.getElementById('logoContent').innerHTML = `
            <span class="material-icons" style="font-size: 52px; color: var(--secondary-color);">cloud_upload</span>
            <p style="margin-top: 12px; color: var(--gray-600); font-size: 14px; text-align: center; font-weight: 600;">Click to upload company logo</p>
        `;

        renderProductTable();
        renderServiceTable();

        document.getElementById('invoicePreview').classList.remove('show');
        document.getElementById('whatsappSection').style.display = 'none';

        toggleGST();
        calculateGrandTotal();
        generateInvoiceId();
        setTodayDate();

        currentInvoiceData = null;
        loadTemplate();

        showSuccess('Form reset successfully! (Notes, Signature & Bank Details preserved)', 3000);

        document.querySelector('.wp-billing-container').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// === TEMPLATE SAVE/LOAD ===
function saveTemplate() {
    const templateData = {
        company: {
            name: document.getElementById('companyName').value,
            tagline: document.getElementById('companyTagline').value,
            phone: document.getElementById('companyPhone').value,
            address: document.getElementById('companyAddress').value,
            gstNo: document.getElementById('companyGST').value,
            hsnSac: document.getElementById('companyHSN').value,
            upi: document.getElementById('companyUPI')?.value || '',
            logo: uploadedLogoFile
        },
        bank: {
            holderName: document.getElementById('bankHolderName').value,
            bankName: document.getElementById('bankName').value,
            accountNo: document.getElementById('bankAccountNo').value,
            ifsc: document.getElementById('bankIFSC').value,
            branch: document.getElementById('bankBranch').value,
            pan: document.getElementById('bankPAN').value
        },
        gst: {
            enabled: document.getElementById('gstEnabled').checked,
            sgstRate: document.getElementById('sgstRate').value,
            cgstRate: document.getElementById('cgstRate').value
        },
        pdfSettings: {
            fontFamily: document.getElementById('pdfFontFamily').value,
            headerFontScale: document.getElementById('pdfHeaderFontScale')?.value || '1',
            bodyFontScale: document.getElementById('pdfBodyFontScale')?.value || '1',
            signatureScale: document.getElementById('signatureScale')?.value || '1.0'
        },
        note: savedNote,
        timestamp: new Date().toISOString()
    };

    try {
        localStorage.setItem('billingTemplate', JSON.stringify(templateData));
        showSuccess('Template saved successfully!', 3000);
    } catch (error) {
        showError('Error saving template. Please try again.');
        console.error('Template save error:', error);
    }
}

function loadTemplate() {
    try {
        const savedTemplate = localStorage.getItem('billingTemplate');
        if (savedTemplate) {
            const data = JSON.parse(savedTemplate);

            // Company
            if (data.company) {
                document.getElementById('companyName').value = data.company.name || '';
                document.getElementById('companyTagline').value = data.company.tagline || '';
                document.getElementById('companyPhone').value = data.company.phone || '';
                document.getElementById('companyAddress').value = data.company.address || '';
                document.getElementById('companyGST').value = data.company.gstNo || '';
                document.getElementById('companyHSN').value = data.company.hsnSac || '';
                if (document.getElementById('companyUPI')) {
                    document.getElementById('companyUPI').value = data.company.upi || '';
                }
                if (data.company.logo) {
                    uploadedLogoFile = data.company.logo;
                    displayLogo(data.company.logo);
                }
            }

            // Bank
            if (data.bank) {
                document.getElementById('bankHolderName').value = data.bank.holderName || '';
                document.getElementById('bankName').value = data.bank.bankName || '';
                document.getElementById('bankAccountNo').value = data.bank.accountNo || '';
                document.getElementById('bankIFSC').value = data.bank.ifsc || '';
                document.getElementById('bankBranch').value = data.bank.branch || '';
                document.getElementById('bankPAN').value = data.bank.pan || '';
            }

            // GST
            if (data.gst) {
                document.getElementById('gstEnabled').checked = data.gst.enabled !== false;
                document.getElementById('sgstRate').value = data.gst.sgstRate || '9';
                document.getElementById('cgstRate').value = data.gst.cgstRate || '9';
                toggleGST();
            }

            // PDF Settings
            if (data.pdfSettings) {
                document.getElementById('pdfFontFamily').value = data.pdfSettings.fontFamily || "'Poppins', sans-serif";
                if (document.getElementById('pdfHeaderFontScale')) {
                    document.getElementById('pdfHeaderFontScale').value = data.pdfSettings.headerFontScale || '1';
                }
                if (document.getElementById('pdfBodyFontScale')) {
                    document.getElementById('pdfBodyFontScale').value = data.pdfSettings.bodyFontScale || '1';
                }
                applyPdfSettings();
                if (data.pdfSettings.signatureScale) {
                    const slider = document.getElementById('signatureScale');
                    if (slider) {
                        slider.value = data.pdfSettings.signatureScale;
                        updateSignatureScaleDisplay(data.pdfSettings.signatureScale, false);
                    }
                }
            }

            // Note
            if (data.note && !savedNote) {
                savedNote = data.note;
                displayNote();
            }
        }
    } catch (error) {
        console.error('Template load error:', error);
    }
}

// === PDF APPEARANCE SETTINGS ===
function applyPdfSettings() {
    const fontFamily = document.getElementById('pdfFontFamily').value;
    const headerScale = document.getElementById('pdfHeaderFontScale')?.value || '1';
    const bodyScale = document.getElementById('pdfBodyFontScale')?.value || '1';
    const preview = document.getElementById('invoicePreview');

    preview.style.setProperty('--inv-font', fontFamily);
    preview.style.setProperty('--inv-heading-font', fontFamily);
    preview.style.setProperty('--inv-header-scale', headerScale);
    preview.style.setProperty('--inv-body-scale', bodyScale);
    preview.style.setProperty('--inv-scale', bodyScale);
}

function onFontSettingChange() {
    applyPdfSettings();
}

/**
 * Format campaign start and end dates as DD.MM.YYYY TO DD.MM.YYYY
 */
function autoUpdateCampaignText() {
    const startVal = document.getElementById('campaignStart').value;
    const endVal = document.getElementById('campaignEnd').value;
    if (startVal && endVal) {
        const startParts = startVal.split('-'); // ["YYYY", "MM", "DD"]
        const endParts = endVal.split('-');
        const formattedStart = `${startParts[2]}.${startParts[1]}.${startParts[0]}`;
        const formattedEnd = `${endParts[2]}.${endParts[1]}.${endParts[0]}`;
        document.getElementById('campaignText').value = `CAMPAIGN: ${formattedStart} TO ${formattedEnd}`;
    }
}

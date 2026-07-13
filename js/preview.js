/* ============================================
   DEVI ADS Invoice System v2.0
   Invoice Data Collection & Preview Population
   ============================================ */

/**
 * Collect all invoice data from form fields
 */
function collectInvoiceData() {
    // Collect product data
    const productData = [];
    const rows = document.querySelectorAll('#productTableBody .table-row');

    rows.forEach((row, index) => {
        const town = row.querySelector('.town-input')?.value.trim() || '';
        const location = row.querySelector('.location-input')?.value.trim() || '';
        const width = parseFloat(row.querySelector('.width-input')?.value) || 0;
        const height = parseFloat(row.querySelector('.height-input')?.value) || 0;
        const sqft = parseFloat(row.querySelector('.sqft-input')?.value) || 0;
        const rate = parseFloat(row.querySelector('.rate-input')?.value) || 0;
        const months = parseFloat(row.querySelector('.months-input')?.value) || 0;
        const amount = parseFloat(row.querySelector('.amount-input')?.value) || 0;

        if ((town || location) && amount > 0) {
            productData.push({
                sno: index + 1,
                town,
                location,
                width,
                height,
                sqft,
                rate,
                months,
                amount
            });
        }
    });

    // Collect service charges
    const serviceCharges = [];
    const serviceRows = document.querySelectorAll('#serviceTableBody .table-row');

    serviceRows.forEach((row, index) => {
        const name = row.querySelector('.service-name-input')?.value.trim() || '';
        const amount = parseFloat(row.querySelector('.service-amount-input')?.value) || 0;
        const excludeCheckbox = row.querySelector('.exclude-gst-checkbox');
        const excludeGst = excludeCheckbox ? excludeCheckbox.checked : false;

        if (name && amount > 0) {
            serviceCharges.push({
                sno: index + 1,
                name,
                amount,
                excludeGst
            });
        }
    });

    // Calculate totals
    const productSubtotal = productData.reduce((sum, item) => sum + item.amount, 0);
    const serviceTotal = serviceCharges.reduce((sum, item) => sum + item.amount, 0);
    const subtotal = productSubtotal + serviceTotal;

    const gstEnabled = document.getElementById('gstEnabled').checked;
    const sgstRate = parseFloat(document.getElementById('sgstRate').value) || 0;
    const cgstRate = parseFloat(document.getElementById('cgstRate').value) || 0;

    let sgst = 0, cgst = 0, totalGst = 0;
    if (gstEnabled) {
        const taxableServiceTotal = serviceCharges.reduce((sum, item) => sum + (item.excludeGst ? 0 : item.amount), 0);
        const taxableSubtotal = productSubtotal + taxableServiceTotal;
        sgst = Math.round(taxableSubtotal * (sgstRate / 100) * 100) / 100;
        cgst = Math.round(taxableSubtotal * (cgstRate / 100) * 100) / 100;
        totalGst = sgst + cgst;
    }

    const grandTotal = subtotal + totalGst;

    currentInvoiceData = {
        company: {
            name: document.getElementById('companyName').value || 'Your Company Name',
            tagline: document.getElementById('companyTagline').value || '',
            phone: document.getElementById('companyPhone').value || '',
            address: document.getElementById('companyAddress').value || '',
            gstNo: document.getElementById('companyGST').value || '',
            hsnSac: document.getElementById('companyHSN').value || '',
            upi: document.getElementById('companyUPI')?.value || '',
            logo: uploadedLogoFile
        },
        customer: {
            name: document.getElementById('customerName').value,
            gstNo: document.getElementById('customerGST').value || '',
            mobile: document.getElementById('customerMobile').value,
            email: document.getElementById('customerEmail').value || '',
            location: document.getElementById('customerLocation').value || ''
        },
        invoice: {
            documentType: document.getElementById('documentType')?.value || 'TAX INVOICE',
            id: document.getElementById('invoiceId').value,
            date: document.getElementById('invoiceDate').value,
            campaignText: document.getElementById('campaignText').value || ''
        },
        bank: {
            holderName: document.getElementById('bankHolderName').value || '',
            bankName: document.getElementById('bankName').value || '',
            accountNo: document.getElementById('bankAccountNo').value || '',
            ifsc: document.getElementById('bankIFSC').value || '',
            branch: document.getElementById('bankBranch').value || '',
            pan: document.getElementById('bankPAN').value || ''
        },
        products: productData,
        serviceCharges: serviceCharges,
        gst: {
            enabled: gstEnabled,
            sgstRate,
            cgstRate
        },
        totals: {
            productSubtotal,
            serviceTotal,
            subtotal,
            sgst,
            cgst,
            totalGst,
            grandTotal
        },
        signature: uploadedSignature,
        signatureScale: uploadedSignatureScale,
        signatureEnabled: document.getElementById('signatureEnabled')?.checked !== false,
        note: savedNote
    };
}

/**
 * Populate the invoice preview with collected data
 */
function populatePreview() {
    if (!currentInvoiceData) return;
    const data = currentInvoiceData;

    // Apply font settings before rendering
    applyPdfSettings();

    // === Company Info ===
    document.getElementById('previewCompanyName').textContent = data.company.name;
    const previewCompanyTagline = document.getElementById('previewCompanyTagline');
    if (previewCompanyTagline) {
        previewCompanyTagline.textContent = data.company.tagline || '';
        previewCompanyTagline.style.display = data.company.tagline ? 'block' : 'none';
    }
    document.getElementById('previewCompanyPhone').innerHTML = data.company.phone
        ? `<strong>Phone:</strong> ${data.company.phone}` : '';
    document.getElementById('previewCompanyAddress').innerHTML = data.company.address
        ? `<strong>Address:</strong> ${data.company.address}` : '';

    // Company GST & HSN
    const companyMeta = document.getElementById('previewCompanyMeta');
    let metaHtml = '';
    if (data.company.gstNo) metaHtml += `<p><strong>GST No:</strong> ${data.company.gstNo}</p>`;
    if (data.company.hsnSac) metaHtml += `<p><strong>HSN/SAC:</strong> ${data.company.hsnSac}</p>`;
    companyMeta.innerHTML = metaHtml;
    companyMeta.style.display = metaHtml ? 'block' : 'none';

    // Logo
    const logoContainer = document.getElementById('previewLogo');
    if (data.company.logo) {
        logoContainer.innerHTML = `<img src="${data.company.logo}" alt="Company Logo" class="invoice-logo" />`;
    } else {
        logoContainer.innerHTML = '';
    }

    // QR Code
    const qrSection = document.getElementById('previewQrSection');
    const qrCodeImg = document.getElementById('previewQrCode');
    if (data.company.upi && data.company.upi.trim()) {
        const payeeName = data.company.name || 'Company';
        const amount = data.totals.grandTotal.toFixed(2);
        const invoiceId = data.invoice.id || 'Invoice';
        const upiUrl = `upi://pay?pa=${encodeURIComponent(data.company.upi.trim())}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=${encodeURIComponent(invoiceId)}&cu=INR`;
        qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
        qrSection.style.display = 'flex';
    } else {
        qrSection.style.display = 'none';
    }

    // === Invoice Meta ===
    const docType = data.invoice.documentType || 'TAX INVOICE';
    const docTitleEl = document.getElementById('previewDocumentTitle');
    const idLabelEl = document.getElementById('previewInvoiceIdLabel');
    
    if (docTitleEl) {
        docTitleEl.textContent = docType;
    }
    if (idLabelEl) {
        idLabelEl.textContent = docType === 'QUOTATION' ? 'Quotation No:' : 'Invoice No:';
    }
    
    document.getElementById('previewInvoiceId').textContent = data.invoice.id;
    document.getElementById('previewInvoiceDate').textContent = formatDate(data.invoice.date);

    // === Campaign Info ===
    const campaignRow = document.getElementById('previewCampaignRow');
    const campaignText = document.getElementById('previewCampaignText');
    if (campaignRow && campaignText) {
        if (data.invoice.campaignText) {
            campaignText.textContent = data.invoice.campaignText;
            campaignRow.style.display = 'block';
        } else {
            campaignRow.style.display = 'none';
        }
    }

    // === Customer Info ===
    document.getElementById('previewCustomerName').textContent = data.customer.name;

    const customerDetails = document.getElementById('previewCustomerDetails');
    let custHtml = '';
    if (data.customer.gstNo) {
        custHtml += `<p><span class="material-icons">badge</span> <strong>GST:</strong> ${data.customer.gstNo}</p>`;
    }
    custHtml += `<p><span class="material-icons">phone</span> ${data.customer.mobile}</p>`;
    if (data.customer.email) {
        custHtml += `<p><span class="material-icons">email</span> ${data.customer.email}</p>`;
    }
    if (data.customer.location) {
        custHtml += `<p><span class="material-icons">location_on</span> ${data.customer.location}</p>`;
    }
    customerDetails.innerHTML = custHtml;

    // === Product Table ===
    const tableBody = document.getElementById('previewTableBody');
    tableBody.innerHTML = '';

    data.products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.sno}</td>
            <td>${product.town}</td>
            <td>${product.location}</td>
            <td>${product.width}</td>
            <td>${product.height}</td>
            <td>${product.sqft.toFixed(2)}</td>
            <td>${formatCurrency(product.rate)}</td>
            <td>${product.months}</td>
            <td><strong>${formatCurrency(product.amount)}</strong></td>
        `;
        tableBody.appendChild(row);
    });

    // === Service Charges ===
    const serviceSection = document.getElementById('previewServiceCharges');
    if (data.serviceCharges.length > 0) {
        let serviceHtml = `
            <h4><span class="material-icons" style="font-size: 18px;">build</span> Service Charges</h4>
            <table class="invoice-service-table">
                <thead><tr><th>Service</th><th>Amount</th></tr></thead>
                <tbody>
        `;
        data.serviceCharges.forEach(sc => {
            const nameSuffix = sc.excludeGst ? ' <span style="font-size: 11px; color: var(--gray-500); font-weight: normal; font-style: italic;">(Excl. GST)</span>' : '';
            serviceHtml += `<tr><td>${sc.name}${nameSuffix}</td><td>${formatCurrency(sc.amount)}</td></tr>`;
        });
        serviceHtml += `
                <tr style="font-weight: 700; border-top: 2px solid var(--gray-300);">
                    <td>Total Service Charges</td>
                    <td>${formatCurrency(data.totals.serviceTotal)}</td>
                </tr>
                </tbody>
            </table>
        `;
        serviceSection.innerHTML = serviceHtml;
        serviceSection.style.display = 'block';
    } else {
        serviceSection.style.display = 'none';
    }

    // === Totals ===
    document.getElementById('previewSubtotal').textContent = formatCurrency(data.totals.subtotal);
    document.getElementById('previewGrandTotal').innerHTML = `<strong>${formatCurrency(data.totals.grandTotal)}</strong>`;

    if (data.gst.enabled && data.totals.subtotal > 0) {
        if (data.totals.sgst > 0) {
            document.getElementById('previewSgstLabel').textContent = `SGST (${data.gst.sgstRate}%)`;
            document.getElementById('previewSgst').textContent = formatCurrency(data.totals.sgst);
            document.getElementById('previewSgstRow').style.display = 'table-row';
        } else {
            document.getElementById('previewSgstRow').style.display = 'none';
        }

        if (data.totals.cgst > 0) {
            document.getElementById('previewCgstLabel').textContent = `CGST (${data.gst.cgstRate}%)`;
            document.getElementById('previewCgst').textContent = formatCurrency(data.totals.cgst);
            document.getElementById('previewCgstRow').style.display = 'table-row';
        } else {
            document.getElementById('previewCgstRow').style.display = 'none';
        }

        if (data.totals.totalGst > 0) {
            document.getElementById('previewTotalGst').textContent = formatCurrency(data.totals.totalGst);
            document.getElementById('previewTotalGstRow').style.display = 'table-row';
        } else {
            document.getElementById('previewTotalGstRow').style.display = 'none';
        }
    } else {
        document.getElementById('previewSgstRow').style.display = 'none';
        document.getElementById('previewCgstRow').style.display = 'none';
        document.getElementById('previewTotalGstRow').style.display = 'none';
    }

    // === Signature ===
    const signatureSection = document.getElementById('previewSignature');
    const sigScale = data.signatureScale || 1.0;
    const sigHeight = 100 * sigScale;
    const sigWidth = 300 * sigScale;
    
    let sigHtml = `<div class="invoice-signature-label" style="font-size: calc(15px * var(--inv-scale));">For ${data.company.name}</div>`;
    const sigEnabled = data.signatureEnabled !== false;
    if (sigEnabled && data.signature) {
        sigHtml += `<img src="${data.signature}" alt="Authorized Signature" style="max-height: ${sigHeight}px; max-width: ${sigWidth}px; object-fit: contain; display: inline-block; margin-top: 8px;" />`;
    } else {
        sigHtml += `<div style="height: 60px;"></div>`; // blank space for manual signature
    }
    signatureSection.innerHTML = sigHtml;
    signatureSection.style.display = 'block';

    // === Notes ===
    const notesSection = document.getElementById('invoiceNotesSection');
    const notesContent = document.getElementById('invoiceNotesContent');
    const bottomLayout = notesSection.closest('.invoice-bottom-layout');

    if (data.note && data.note.trim()) {
        notesContent.innerHTML = data.note;
        notesSection.style.display = 'block';
        bottomLayout.classList.add('has-notes');
    } else {
        notesSection.style.display = 'none';
        bottomLayout.classList.remove('has-notes');
    }

    // === Bank Details ===
    const bankSection = document.getElementById('previewBankDetails');
    const hasBankData = data.bank.holderName || data.bank.bankName || data.bank.accountNo;

    if (hasBankData) {
        let bankHtml = '<h4>Bank Details</h4><div class="invoice-bank-grid">';
        if (data.bank.holderName) bankHtml += `<p><strong>Name:</strong> ${data.bank.holderName}</p>`;
        if (data.bank.bankName) bankHtml += `<p><strong>Bank:</strong> ${data.bank.bankName}</p>`;
        if (data.bank.accountNo) bankHtml += `<p><strong>A/C No:</strong> ${data.bank.accountNo}</p>`;
        if (data.bank.ifsc) bankHtml += `<p><strong>IFSC:</strong> ${data.bank.ifsc}</p>`;
        if (data.bank.branch) bankHtml += `<p><strong>Branch:</strong> ${data.bank.branch}</p>`;
        if (data.bank.pan) bankHtml += `<p><strong>PAN:</strong> ${data.bank.pan}</p>`;
        bankHtml += '</div>';
        bankSection.innerHTML = bankHtml;
        bankSection.style.display = 'block';
    } else {
        bankSection.style.display = 'none';
    }
}

/**
 * Preview the invoice
 */
function previewInvoice() {
    if (!validateForm()) return;

    collectInvoiceData();
    populatePreview();

    document.getElementById('invoicePreview').classList.add('show');
    document.getElementById('whatsappSection').style.display = 'block';

    document.getElementById('invoicePreview').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    updateWhatsAppPreview();
    showSuccess('Invoice preview generated!', 3000);
}

/**
 * Close the preview
 */
function closePreview() {
    document.getElementById('invoicePreview').classList.remove('show');
    document.getElementById('whatsappSection').style.display = 'none';
    document.querySelector('.wp-billing-container').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

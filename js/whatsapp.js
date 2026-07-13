/* ============================================
   DEVI ADS Invoice System v2.0
   WhatsApp Integration
   ============================================ */

/**
 * Update WhatsApp message preview with current invoice data
 */
function updateWhatsAppPreview() {
    if (!currentInvoiceData) {
        collectInvoiceData();
    }

    const data = currentInvoiceData;
    const customMessage = document.getElementById('whatsappMessage').value;

    let message = '';
    if (customMessage.trim()) {
        message += `${customMessage}\n\n`;
    }

    const docType = data.invoice.documentType || 'TAX INVOICE';
    message += `📋 *${docType}*\n\n`;
    message += `🏢 *Company:* ${data.company.name}\n`;
    if (data.company.phone) message += `📞 *Phone:* ${data.company.phone}\n`;
    if (data.company.address) message += `📍 *Address:* ${data.company.address}\n`;
    if (data.company.gstNo) message += `🔖 *GST No:* ${data.company.gstNo}\n`;
    message += '\n';

    message += `👤 *Customer:* ${data.customer.name}\n`;
    if (data.customer.gstNo) message += `🔖 *Customer GST:* ${data.customer.gstNo}\n`;
    message += `📱 *Mobile:* ${data.customer.mobile}\n`;
    if (data.customer.email) message += `✉️ *Email:* ${data.customer.email}\n`;
    if (data.customer.location) message += `📍 *Location:* ${data.customer.location}\n`;

    const idLabel = docType === 'QUOTATION' ? 'Quotation ID' : 'Invoice ID';
    message += `\n🧾 *${idLabel}:* ${data.invoice.id}\n`;
    message += `📅 *Date:* ${formatDate(data.invoice.date)}\n`;
    if (data.invoice.campaignText) {
        message += `📅 *Campaign:* ${data.invoice.campaignText}\n`;
    }
    message += '\n';

    // Products
    if (data.products.length > 0) {
        message += `🏗️ *HOARDING DETAILS:*\n`;
        data.products.forEach((product, index) => {
            message += `${index + 1}. ${product.town}`;
            if (product.location) message += ` - ${product.location}`;
            message += `\n`;
            message += `   ${product.width}×${product.height} = ${product.sqft.toFixed(0)} Sq.Ft`;
            message += ` × ₹${product.rate}/Sq.Ft × ${product.months} ${product.months === 1 ? 'month' : 'months'}`;
            message += ` = ${formatCurrency(product.amount)}\n\n`;
        });
    }

    // Service charges
    if (data.serviceCharges.length > 0) {
        message += `🔧 *SERVICE CHARGES:*\n`;
        data.serviceCharges.forEach((sc, index) => {
            message += `${index + 1}. ${sc.name}: ${formatCurrency(sc.amount)}${sc.excludeGst ? ' (Excl. GST)' : ''}\n`;
        });
        message += '\n';
    }

    // Totals
    message += `💰 *PAYMENT SUMMARY:*\n`;
    message += `Subtotal: ${formatCurrency(data.totals.subtotal)}\n`;

    if (data.gst.enabled && data.totals.subtotal > 0) {
        if (data.totals.sgst > 0) {
            message += `SGST (${data.gst.sgstRate}%): ${formatCurrency(data.totals.sgst)}\n`;
        }
        if (data.totals.cgst > 0) {
            message += `CGST (${data.gst.cgstRate}%): ${formatCurrency(data.totals.cgst)}\n`;
        }
        if (data.totals.totalGst > 0) {
            message += `Total GST: ${formatCurrency(data.totals.totalGst)}\n`;
        }
    }

    message += `*GRAND TOTAL: ${formatCurrency(data.totals.grandTotal)}*\n\n`;

    if (data.note && data.note.trim()) {
        const plainNote = data.note.replace(/<[^>]*>/g, '');
        message += `📝 *NOTES & TERMS:*\n${plainNote}\n\n`;
    }

    // Bank Details
    const hasBankData = data.bank.holderName || data.bank.bankName || data.bank.accountNo;
    if (hasBankData) {
        message += `🏦 *BANK DETAILS FOR PAYMENT:*\n`;
        if (data.bank.holderName) message += `*A/C Name:* ${data.bank.holderName}\n`;
        if (data.bank.bankName) message += `*Bank:* ${data.bank.bankName}\n`;
        if (data.bank.accountNo) message += `*A/C No:* ${data.bank.accountNo}\n`;
        if (data.bank.ifsc) message += `*IFSC:* ${data.bank.ifsc}\n`;
        if (data.bank.branch) message += `*Branch:* ${data.bank.branch}\n`;
        if (data.bank.pan) message += `*PAN:* ${data.bank.pan}\n`;
    }

    message = message.trim();

    document.getElementById('whatsappPreviewText').textContent = message;
}

/**
 * Open WhatsApp with the invoice message
 */
function sendWhatsAppMessage() {
    if (!currentInvoiceData) {
        showError('Please generate invoice preview first.');
        return;
    }

    const mobile = currentInvoiceData.customer.mobile;
    const message = document.getElementById('whatsappPreviewText').textContent;

    const cleanMobile = mobile.replace(/\D/g, '');
    const formattedMobile = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;

    const whatsappUrl = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showSuccess('Opening WhatsApp...', 3000);
}

/**
 * Copy WhatsApp message to clipboard
 */
async function copyWhatsAppMessage() {
    if (!currentInvoiceData) {
        showError('Please generate invoice preview first.');
        return;
    }

    const message = document.getElementById('whatsappPreviewText').textContent;

    try {
        await navigator.clipboard.writeText(message);
        showSuccess('Message copied to clipboard!', 3000);
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = message;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccess('Message copied to clipboard!', 3000);
    }
}

/**
 * Scroll to or generate full invoice preview
 */
function previewFullInvoice() {
    if (document.getElementById('invoicePreview').classList.contains('show')) {
        document.getElementById('invoicePreview').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        previewInvoice();
    }
}

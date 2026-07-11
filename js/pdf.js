/* ============================================
   DEVI ADS Invoice System v2.0
   PDF Generation (jsPDF + html2canvas)
   ============================================ */

/**
 * Helper to prevent an element from splitting across pages by inserting a vertical spacer.
 */
async function preventElementSplit(targetElement, pageHeightInPixels, elementRect, topMargin) {
    if (!targetElement || window.getComputedStyle(targetElement).display === 'none') {
        return null;
    }
    const targetRect = targetElement.getBoundingClientRect();
    const targetRelativeTop = targetRect.top - elementRect.top;
    const targetRelativeBottom = targetRect.bottom - elementRect.top;
    
    const startPage = Math.floor(targetRelativeTop / pageHeightInPixels);
    const endPage = Math.floor(targetRelativeBottom / pageHeightInPixels);
    
    const spaceUsedOnPage = targetRelativeTop % pageHeightInPixels;
    const spaceLeftOnPage = pageHeightInPixels - spaceUsedOnPage;

    let spacerHeight = 0;
    if (spaceUsedOnPage < topMargin) {
        // If it starts too close to the top of a page, push it down to topMargin
        spacerHeight = topMargin - spaceUsedOnPage;
    } else if (startPage !== endPage) {
        // If it spans across page boundaries, push it to start on the next page with topMargin
        spacerHeight = spaceLeftOnPage + topMargin;
    }

    if (spacerHeight > 0) {
        const spacer = document.createElement('div');
        spacer.className = 'pdf-page-spacer';
        spacer.style.height = `${spacerHeight}px`;
        spacer.style.width = '100%';
        targetElement.parentNode.insertBefore(spacer, targetElement);
        // Wait a short duration to let layout update
        await new Promise(resolve => setTimeout(resolve, 150));
        return spacer;
    }
    return null;
}

/**
 * Generate PDF invoice with A4 optimization and filing margin
 */
async function generateInvoice() {
    if (!validateForm()) return;

    showLoading();

    let spacers = [];

    try {
        collectInvoiceData();
        populatePreview();

        const element = document.getElementById('invoicePreview');
        element.classList.add('show');
        await new Promise(resolve => setTimeout(resolve, 600));

        const elementRect = element.getBoundingClientRect();
        const A4_RATIO = 297 / 210;
        const pageHeightInPixels = elementRect.width * A4_RATIO;
        const topMargin = 60; // top padding on subsequent pages

        // Sequential page break check for key layout blocks
        const serviceCharges = document.getElementById('previewServiceCharges');
        const spacerService = await preventElementSplit(serviceCharges, pageHeightInPixels, elementRect, topMargin);
        if (spacerService) spacers.push(spacerService);

        const bottomLayout = document.querySelector('.invoice-bottom-layout');
        const spacerBottom = await preventElementSplit(bottomLayout, pageHeightInPixels, elementRect, topMargin);
        if (spacerBottom) spacers.push(spacerBottom);

        const previewSignature = document.getElementById('previewSignature');
        const spacerSig = await preventElementSplit(previewSignature, pageHeightInPixels, elementRect, topMargin);
        if (spacerSig) spacers.push(spacerSig);

        const invoiceFooter = document.querySelector('.invoice-footer');
        const spacerFooter = await preventElementSplit(invoiceFooter, pageHeightInPixels, elementRect, topMargin);
        if (spacerFooter) spacers.push(spacerFooter);

        // Capture at high resolution for print quality
        const canvas = await html2canvas(element, {
            scale: 2.0,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Remove spacers
        spacers.forEach(s => s.remove());
        spacers = [];

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // First page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        // Additional pages
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
        }

        // Save PDF
        const customerName = currentInvoiceData.customer.name.replace(/\s+/g, '_');
        const fileName = `Invoice_${currentInvoiceData.invoice.id}_${customerName}.pdf`;
        pdf.save(fileName);

        hideLoading();
        showSuccess('Invoice PDF generated and downloaded!', 5000);

        document.getElementById('whatsappSection').style.display = 'block';
        updateWhatsAppPreview();

    } catch (error) {
        hideLoading();
        showError('Error generating PDF. Please try again.');
        console.error('PDF generation error:', error);
    } finally {
        spacers.forEach(s => s.remove());
        document.getElementById('invoicePreview').classList.remove('show');
    }
}

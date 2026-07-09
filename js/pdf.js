/* ============================================
   DEVI ADS Invoice System v2.0
   PDF Generation (jsPDF + html2canvas)
   ============================================ */

/**
 * Generate PDF invoice with A4 optimization and filing margin
 */
async function generateInvoice() {
    if (!validateForm()) return;

    showLoading();

    let spacer = null;

    try {
        collectInvoiceData();
        populatePreview();

        const element = document.getElementById('invoicePreview');
        element.classList.add('show');
        await new Promise(resolve => setTimeout(resolve, 600));

        // Page break prevention for notes section
        const notesSection = document.getElementById('invoiceNotesSection');
        if (notesSection && window.getComputedStyle(notesSection).display !== 'none') {
            const elementRect = element.getBoundingClientRect();
            const notesRect = notesSection.getBoundingClientRect();
            const A4_RATIO = 297 / 210;
            const pageHeightInPixels = elementRect.width * A4_RATIO;
            const notesRelativeTop = notesRect.top - elementRect.top;
            const startPage = Math.floor(notesRelativeTop / pageHeightInPixels);
            const endPage = Math.floor((notesRelativeTop + notesRect.height) / pageHeightInPixels);

            if (startPage !== endPage) {
                const spaceUsedOnPage = notesRelativeTop % pageHeightInPixels;
                const spacerHeight = pageHeightInPixels - spaceUsedOnPage;
                spacer = document.createElement('div');
                spacer.style.height = `${spacerHeight}px`;
                notesSection.parentNode.insertBefore(spacer, notesSection);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Capture at high resolution for print quality
        const canvas = await html2canvas(element, {
            scale: 2.0,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Remove spacer
        if (spacer) {
            spacer.remove();
            spacer = null;
        }

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
        if (spacer) spacer.remove();
        document.getElementById('invoicePreview').classList.remove('show');
    }
}

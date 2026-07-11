/* ============================================
   DEVI ADS Invoice System v2.0
   Application Initialization & Global State
   ============================================ */

// === GLOBAL STATE ===
let uploadedLogoFile = null;
let currentInvoiceData = null;
let savedNote = '';
let uploadedSignature = null;
let uploadedSignatureScale = 1.0;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function () {
    loadInvoiceId();
    setTodayDate();
    renderProductTable();
    renderServiceTable();
    calculateGrandTotal();
    toggleGST();
    loadSavedNote();
    loadSignature();
    loadTemplate();
    applyPdfSettings();
});

function loadInvoiceId() {
    const invoiceIdInput = document.getElementById('invoiceId');
    if (invoiceIdInput) {
        const savedInvoiceId = localStorage.getItem('billingInvoiceNumber') || '';
        invoiceIdInput.value = savedInvoiceId;
        
        invoiceIdInput.addEventListener('input', function() {
            localStorage.setItem('billingInvoiceNumber', this.value);
        });
    }
}

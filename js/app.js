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
    generateInvoiceId();
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

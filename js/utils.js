/* ============================================
   DEVI ADS Invoice System v2.0
   Utility Functions
   ============================================ */

/**
 * Format a date string to "DD Month YYYY" format with 2-digit day
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "09 July 2026"
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-IN', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Format a number as Indian currency
 * @param {number} amount
 * @returns {string} Formatted like "₹1,00,000.00"
 */
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Show success notification
 * @param {string} message
 * @param {number} duration - ms to show
 */
function showSuccess(message, duration = 3000) {
    const el = document.getElementById('successMessage');
    const textEl = document.getElementById('successText');
    textEl.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
}

/**
 * Show error notification
 * @param {string} message
 * @param {number} duration - ms to show
 */
function showError(message, duration = 5000) {
    const el = document.getElementById('errorMessage');
    const textEl = document.getElementById('errorText');
    textEl.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
}

/** Show loading overlay */
function showLoading() {
    document.getElementById('loadingAnimation').classList.add('show');
}

/** Hide loading overlay */
function hideLoading() {
    document.getElementById('loadingAnimation').classList.remove('show');
}

/**
 * Generate auto invoice ID
 * @returns {string} ID like "INV-202607-1234"
 */
function generateInvoiceId() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const invoiceId = `INV-${year}${month}-${randomNum}`;
    document.getElementById('invoiceId').value = invoiceId;
    return invoiceId;
}

/** Set today's date in the invoice date input */
function setTodayDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = formattedDate;
}

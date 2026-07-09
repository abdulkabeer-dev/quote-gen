/* ============================================
   DEVI ADS Invoice System v2.0
   GST Toggle & Grand Total Calculation
   ============================================ */

/**
 * Toggle GST calculation on/off
 */
function toggleGST() {
    const gstEnabled = document.getElementById('gstEnabled').checked;
    const gstRatesSection = document.getElementById('gstRatesSection');

    gstRatesSection.style.display = gstEnabled ? 'grid' : 'none';
    calculateGrandTotal();
}

/**
 * Calculate grand total including products + service charges + GST
 * Subtotal = Sum(product amounts) + Sum(service charges)
 * SGST = Subtotal × sgstRate%
 * CGST = Subtotal × cgstRate%
 * Total GST = SGST + CGST
 * Grand Total = Subtotal + Total GST
 */
function calculateGrandTotal() {
    const productSubtotal = getProductSubtotal();
    const serviceChargesTotal = getServiceChargesTotal();
    const subtotal = productSubtotal + serviceChargesTotal;

    const gstEnabled = document.getElementById('gstEnabled').checked;
    let sgst = 0, cgst = 0, totalGst = 0;
    let grandTotal = subtotal;

    if (gstEnabled) {
        const taxableServiceTotal = typeof getTaxableServiceChargesTotal === 'function' ? getTaxableServiceChargesTotal() : serviceChargesTotal;
        const taxableSubtotal = productSubtotal + taxableServiceTotal;
        
        const sgstRate = parseFloat(document.getElementById('sgstRate').value) || 0;
        const cgstRate = parseFloat(document.getElementById('cgstRate').value) || 0;

        sgst = Math.round(taxableSubtotal * (sgstRate / 100) * 100) / 100;
        cgst = Math.round(taxableSubtotal * (cgstRate / 100) * 100) / 100;
        totalGst = sgst + cgst;

        grandTotal = subtotal + totalGst;

        document.getElementById('sgstRateDisplay').textContent = `${sgstRate}%`;
        document.getElementById('cgstRateDisplay').textContent = `${cgstRate}%`;
    }

    // Update UI
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('sgstAmount').textContent = formatCurrency(sgst);
    document.getElementById('cgstAmount').textContent = formatCurrency(cgst);
    document.getElementById('totalGstAmount').textContent = formatCurrency(totalGst);
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);

    // Also show service charges total if any
    const serviceDisplay = document.getElementById('serviceChargesDisplay');
    if (serviceDisplay) {
        serviceDisplay.textContent = formatCurrency(serviceChargesTotal);
        document.getElementById('serviceChargesRow').style.display = serviceChargesTotal > 0 ? 'flex' : 'none';
    }

    // Show/hide GST rows
    const sgstRow = document.getElementById('sgstRow');
    const cgstRow = document.getElementById('cgstRow');
    const totalGstRow = document.getElementById('totalGstRow');

    if (gstEnabled && subtotal > 0) {
        sgstRow.style.display = sgst > 0 ? 'flex' : 'none';
        cgstRow.style.display = cgst > 0 ? 'flex' : 'none';
        totalGstRow.style.display = totalGst > 0 ? 'flex' : 'none';
    } else {
        sgstRow.style.display = 'none';
        cgstRow.style.display = 'none';
        totalGstRow.style.display = 'none';
    }
}

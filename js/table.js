/* ============================================
   DEVI ADS Invoice System v2.0
   Product Table (Manual Entry Only)
   Columns: S.No, Town, Location, Width, Height, Total Sq.Ft, No. of Days, Rate/Day, Amount
   ============================================ */

/**
 * Render the product table header and add initial row
 */
function renderProductTable() {
    const header = document.getElementById('productTableHeader');
    const body = document.getElementById('productTableBody');

    header.innerHTML = `
        <tr>
            <th class="col-sno">S.No</th>
            <th class="col-town">Town</th>
            <th class="col-location">Location</th>
            <th class="col-width">Width</th>
            <th class="col-height">Height</th>
            <th class="col-sqft">Total Sq.Ft</th>
            <th class="col-rate">Rate/Sq.Ft (₹)</th>
            <th class="col-months">No. of Months</th>
            <th class="col-amount">Amount (₹)</th>
            <th class="col-actions">Actions</th>
        </tr>
    `;

    body.innerHTML = '';
    addProductRow();
    calculateGrandTotal();
}

/**
 * Add a new product row to the table
 */
function addProductRow() {
    const tableBody = document.getElementById('productTableBody');
    const rowCount = tableBody.children.length + 1;

    const newRow = document.createElement('tr');
    newRow.className = 'table-row';

    newRow.innerHTML = `
        <td class="table-cell" data-label="S.No">${rowCount}</td>
        <td class="table-cell" data-label="Town">
            <input type="text" class="table-input town-input" placeholder="Town name" />
        </td>
        <td class="table-cell" data-label="Location">
            <input type="text" class="table-input location-input" placeholder="Location details" />
        </td>
        <td class="table-cell" data-label="Width">
            <input type="number" class="table-input width-input" placeholder="0" min="0" step="0.01"
                   oninput="calculateRowTotal(this)" />
        </td>
        <td class="table-cell" data-label="Height">
            <input type="number" class="table-input height-input" placeholder="0" min="0" step="0.01"
                   oninput="calculateRowTotal(this)" />
        </td>
        <td class="table-cell" data-label="Total Sq.Ft">
            <input type="number" class="table-input sqft-input" placeholder="0" readonly />
        </td>
        <td class="table-cell" data-label="Rate/Sq.Ft">
            <input type="number" class="table-input rate-input" placeholder="0.00" min="0" step="0.01"
                   oninput="calculateRowTotal(this)" />
        </td>
        <td class="table-cell" data-label="No. of Months">
            <input type="number" class="table-input months-input" placeholder="1" min="0.01" value="1" step="0.01"
                   oninput="calculateRowTotal(this)" />
        </td>
        <td class="table-cell" data-label="Amount">
            <input type="number" class="table-input amount-input" placeholder="0.00" readonly />
        </td>
        <td class="table-cell" data-label="Actions">
            <button class="btn btn-danger btn-icon-only" onclick="removeProductRow(this)" title="Remove Row">
                <span class="material-icons">close</span>
            </button>
        </td>
    `;

    tableBody.appendChild(newRow);
}

/**
 * Calculate row total: Sq.Ft = Width × Height, Amount = Sq.Ft × Rate × Days
 * @param {HTMLElement} element - Any input in the row
 */
function calculateRowTotal(element) {
    const row = element.closest('tr');

    const width = parseFloat(row.querySelector('.width-input').value) || 0;
    const height = parseFloat(row.querySelector('.height-input').value) || 0;
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const months = parseFloat(row.querySelector('.months-input').value) || 0;

    const sqft = width * height;
    const amount = sqft * rate * months;

    row.querySelector('.sqft-input').value = sqft > 0 ? sqft.toFixed(2) : '';
    row.querySelector('.amount-input').value = amount > 0 ? amount.toFixed(2) : '';

    calculateGrandTotal();
}

/**
 * Remove a specific product row
 * @param {HTMLElement} button - The remove button clicked
 */
function removeProductRow(button) {
    const tableBody = document.getElementById('productTableBody');
    if (tableBody.children.length > 1) {
        button.closest('tr').remove();
        renumberProductRows();
        calculateGrandTotal();
        showSuccess('Row removed', 2000);
    } else {
        showError('Cannot remove the last product row.');
    }
}

/**
 * Remove the last product row
 */
function removeLastRow() {
    const tableBody = document.getElementById('productTableBody');
    if (tableBody.children.length > 1) {
        tableBody.removeChild(tableBody.lastElementChild);
        renumberProductRows();
        calculateGrandTotal();
        showSuccess('Product row removed', 2000);
    } else {
        showError('Cannot remove the last product row.');
    }
}

/**
 * Renumber S.No column after row removal
 */
function renumberProductRows() {
    const rows = document.querySelectorAll('#productTableBody .table-row');
    rows.forEach((row, index) => {
        row.querySelector('td:first-child').textContent = index + 1;
    });
}

/**
 * Get the product subtotal (sum of all Amount fields)
 * @returns {number}
 */
function getProductSubtotal() {
    let subtotal = 0;
    document.querySelectorAll('#productTableBody .amount-input').forEach(input => {
        subtotal += parseFloat(input.value) || 0;
    });
    return subtotal;
}

// === SERVICE CHARGES ===

/**
 * Render the service charges table with header and initial empty state
 */
function renderServiceTable() {
    const body = document.getElementById('serviceTableBody');
    if (body) {
        body.innerHTML = '';
    }
}

/**
 * Add a new service charge row
 */
function addServiceChargeRow() {
    const tableBody = document.getElementById('serviceTableBody');
    const rowCount = tableBody.children.length + 1;

    const newRow = document.createElement('tr');
    newRow.className = 'table-row';

    newRow.innerHTML = `
        <td class="table-cell" data-label="S.No">${rowCount}</td>
        <td class="table-cell" data-label="Service Name">
            <input type="text" class="table-input service-name-input" placeholder="e.g. Mounting Charges"
                   list="serviceNameSuggestions" />
        </td>
        <td class="table-cell" data-label="Exclude GST" style="text-align: center;">
            <input type="checkbox" class="exclude-gst-checkbox" onchange="calculateGrandTotal()" style="width: 18px; height: 18px; cursor: pointer;" />
        </td>
        <td class="table-cell" data-label="Amount">
            <input type="number" class="table-input service-amount-input" placeholder="0.00" min="0" step="0.01"
                   oninput="calculateGrandTotal()" />
        </td>
        <td class="table-cell" data-label="Actions">
            <button class="btn btn-danger btn-icon-only" onclick="removeServiceRow(this)" title="Remove">
                <span class="material-icons">close</span>
            </button>
        </td>
    `;

    tableBody.appendChild(newRow);
}

/**
 * Remove a specific service charge row
 * @param {HTMLElement} button
 */
function removeServiceRow(button) {
    button.closest('tr').remove();
    renumberServiceRows();
    calculateGrandTotal();
    showSuccess('Service charge removed', 2000);
}

/**
 * Remove the last service charge row
 */
function removeLastServiceRow() {
    const tableBody = document.getElementById('serviceTableBody');
    if (tableBody.children.length > 0) {
        tableBody.removeChild(tableBody.lastElementChild);
        renumberServiceRows();
        calculateGrandTotal();
        showSuccess('Service charge removed', 2000);
    } else {
        showError('No service charges to remove.');
    }
}

/**
 * Renumber service charge S.No column
 */
function renumberServiceRows() {
    const rows = document.querySelectorAll('#serviceTableBody .table-row');
    rows.forEach((row, index) => {
        row.querySelector('td:first-child').textContent = index + 1;
    });
}

/**
 * Get total of all service charges
 * @returns {number}
 */
function getServiceChargesTotal() {
    let total = 0;
    document.querySelectorAll('#serviceTableBody .service-amount-input').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    return total;
}

/**
 * Get taxable service charges total (excluding rows where 'exclude-gst' is checked)
 * @returns {number}
 */
function getTaxableServiceChargesTotal() {
    let total = 0;
    document.querySelectorAll('#serviceTableBody .table-row').forEach(row => {
        const amountInput = row.querySelector('.service-amount-input');
        const excludeCheckbox = row.querySelector('.exclude-gst-checkbox');
        
        const isExcluded = excludeCheckbox ? excludeCheckbox.checked : false;
        const amount = parseFloat(amountInput?.value) || 0;
        
        if (!isExcluded) {
            total += amount;
        }
    });
    return total;
}

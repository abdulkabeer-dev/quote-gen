/* ============================================
   DEVI ADS Invoice System v2.0
   Reference Information Modal & Auto-Fill
   ============================================ */

const REFERENCE_DATA = {
    company: {
        name: "DEVI ADS",
        tagline: "OUT DOOR SERVICES",
        phone: "+919440292923, 08518796233 (Landline)",
        upi: "14970249@kvb",
        gstNo: "37AGOPG1150H1ZJ",
        hsnSac: "998361",
        address: "G 2, A Block, Ground Floor, Surya Towers, Near Devi Building, Challa Compound, Bhagya Nagar, Kurnool - 518004"
    },
    terms: `<ul>
  <li>Please check the copies of advertisements released, attached to the bill.</li>
  <li>Check the bill amount and notify us immediately if incorrect.</li>
  <li>Amount should be remitted through cheque/D.D. in favour of M/s DEVI ADS.</li>
  <li>Bill amount not paid on the agreed date shall be charged 24% per annum.</li>
  <li>Please acknowledge the attached copy to the original invoice/bill</li>
</ul>`,
    bank: {
        holderName: "DEVI ADS",
        bankName: "Karur Vysya Bank",
        accountNo: "1405115000002402",
        ifsc: "KVBL0001405",
        branch: "Kurnool (AP)",
        pan: "AGOPG1105H"
    }
};

// Raw plain-text format matching the requested text block precisely
const RAW_REFERENCE_TEXT = `DEVI ADS
OUT DOOR SERVICES
+919440292923, 08518796233 (Landline)
14970249@kvb
37AGOPG1150H1ZJ
998361
G 2, A Block, Ground Floor, Surya Towers, Near Devi Building, Challa Compound, Bhagya Nagar, Kurnool - 518004

-------------------

- Please check the copies of advertisements released, attached to the bill.
- Check the bill amount and notify us immediately if incorrect.
- Amount should be remitted through cheque/D.D. in favour of M/s DEVI ADS.
- Bill amount not paid on the agreed date shall be charged 24% per annum.
- Please acknowledge the attached copy to the original invoice/bill

----------------
DEVI ADS
Karur Vysya Bank
1405115000002402
KVBL0001405
Kurnool (AP)
AGOPG1105H`;

/**
 * Open the reference info modal
 */
function openReferenceModal() {
    const modal = document.getElementById('referenceModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

/**
 * Close the reference info modal
 */
function closeReferenceModal() {
    const modal = document.getElementById('referenceModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Copy text content to clipboard with dynamic button UI feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement} btn - Button element that triggered the copy
 */
function copyToClipboard(text, btn) {
    if (!navigator.clipboard) {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showBtnSuccess(btn);
        } catch (err) {
            console.error('Fallback copy failed', err);
            showError('Failed to copy text.');
        }
        document.body.removeChild(textarea);
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showBtnSuccess(btn);
    }).catch(err => {
        console.error('Copy failed', err);
        showError('Failed to copy text.');
    });
}

function showBtnSuccess(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-icons">check_circle</span> Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
    }, 2000);
    showSuccess('Copied to clipboard!', 1500);
}

/**
 * Auto-fills a specific section of the form
 * @param {string} section - 'company' | 'terms' | 'bank'
 */
function autoFillSection(section) {
    if (section === 'company') {
        document.getElementById('companyName').value = REFERENCE_DATA.company.name;
        document.getElementById('companyTagline').value = REFERENCE_DATA.company.tagline;
        document.getElementById('companyPhone').value = REFERENCE_DATA.company.phone;
        document.getElementById('companyAddress').value = REFERENCE_DATA.company.address;
        document.getElementById('companyGST').value = REFERENCE_DATA.company.gstNo;
        document.getElementById('companyHSN').value = REFERENCE_DATA.company.hsnSac;
        if (document.getElementById('companyUPI')) {
            document.getElementById('companyUPI').value = REFERENCE_DATA.company.upi;
        }
        showSuccess('Company Details filled!', 2000);
    } else if (section === 'terms') {
        savedNote = REFERENCE_DATA.terms;
        try {
            localStorage.setItem('billingSavedNote', savedNote);
        } catch (e) {
            console.error(e);
        }
        displayNote();
        const clearBtn = document.getElementById('clearNoteBtn');
        if (clearBtn) {
            clearBtn.style.display = 'inline-flex';
        }
        showSuccess('Terms & Conditions filled!', 2000);
    } else if (section === 'bank') {
        document.getElementById('bankHolderName').value = REFERENCE_DATA.bank.holderName;
        document.getElementById('bankName').value = REFERENCE_DATA.bank.bankName;
        document.getElementById('bankAccountNo').value = REFERENCE_DATA.bank.accountNo;
        document.getElementById('bankIFSC').value = REFERENCE_DATA.bank.ifsc;
        document.getElementById('bankBranch').value = REFERENCE_DATA.bank.branch;
        document.getElementById('bankPAN').value = REFERENCE_DATA.bank.pan;
        showSuccess('Bank Details filled!', 2000);
    }

    // Recalculate totals and refresh preview since form elements changed
    calculateGrandTotal();
    collectInvoiceData();
    populatePreview();
}

/**
 * Auto-fills all form fields with reference data and saves template to localStorage
 */
function autoFillAll() {
    autoFillSection('company');
    autoFillSection('terms');
    autoFillSection('bank');
    
    // Automatically save the template so that it persists across reloads immediately
    saveTemplate();
    showSuccess('All reference data filled and saved to template!', 3000);
}

/* ============================================
   DEVI ADS Invoice System v2.0
   Notes Section CRUD & Formatting
   ============================================ */

/**
 * Load saved note from localStorage
 */
function loadSavedNote() {
    try {
        savedNote = localStorage.getItem('billingSavedNote') || '';
        if (savedNote) {
            displayNote();
            document.getElementById('clearNoteBtn').style.display = 'inline-flex';
        }
    } catch (error) {
        console.error('Error loading saved note:', error);
    }
}

/**
 * Display note content in the view area
 */
function displayNote() {
    const noteDisplay = document.getElementById('noteDisplay');
    const editNoteBtn = document.getElementById('editNoteBtn');

    if (savedNote.trim()) {
        noteDisplay.innerHTML = savedNote;
        noteDisplay.classList.remove('empty');
        editNoteBtn.innerHTML = '<span class="material-icons">edit</span> Edit Note';
    } else {
        noteDisplay.innerHTML = `
            <div class="empty">
                <span class="material-icons" style="font-size: 48px; color: var(--gray-400); margin-bottom: 16px;">note_add</span>
                <div>
                    <p>No notes added yet</p>
                    <p style="font-size: 14px; margin-top: 8px;">Click "Add Note" to include terms, conditions, or special instructions</p>
                </div>
            </div>
        `;
        noteDisplay.classList.add('empty');
        editNoteBtn.innerHTML = '<span class="material-icons">edit</span> Add Note';
    }
}

/**
 * Toggle note edit mode
 */
function toggleNoteEdit() {
    const noteDisplay = document.getElementById('noteDisplay');
    const noteEditor = document.getElementById('noteEditor');
    const noteActions = document.getElementById('noteActions');
    const editingActions = document.getElementById('editingActions');
    const noteTextarea = document.getElementById('noteTextarea');

    noteDisplay.style.display = 'none';
    noteEditor.classList.add('active');
    noteActions.style.display = 'none';
    editingActions.style.display = 'flex';

    noteTextarea.value = savedNote;
    noteTextarea.focus();
}

/**
 * Format note text (bold, italic, lists)
 * @param {string} command
 */
function formatNoteText(command) {
    const textarea = document.getElementById('noteTextarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (command === 'bold') {
        replacement = `<b>${selected || 'bold text'}</b>`;
    } else if (command === 'italic') {
        replacement = `<i>${selected || 'italic text'}</i>`;
    } else if (command === 'number') {
        replacement = selected
            ? `<ol>\n  <li>${selected.split('\n').join('</li>\n  <li>')}</li>\n</ol>`
            : `<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ol>`;
    } else if (command === 'bullet') {
        replacement = selected
            ? `<ul>\n  <li>${selected.split('\n').join('</li>\n  <li>')}</li>\n</ul>`
            : `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>`;
    }

    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    textarea.selectionStart = start;
    textarea.selectionEnd = start + replacement.length;
}

/**
 * Save note to localStorage
 */
function saveNote() {
    const noteTextarea = document.getElementById('noteTextarea');
    savedNote = noteTextarea.value.trim();

    try {
        localStorage.setItem('billingSavedNote', savedNote);
    } catch (error) {
        console.error('Error saving note:', error);
        showError('Error saving note. Please try again.');
        return;
    }

    cancelEditNote();
    displayNote();

    const clearBtn = document.getElementById('clearNoteBtn');
    if (savedNote) {
        clearBtn.style.display = 'inline-flex';
        showSuccess('Note saved successfully!', 2000);
    } else {
        clearBtn.style.display = 'none';
    }
}

/**
 * Cancel note editing
 */
function cancelEditNote() {
    document.getElementById('noteDisplay').style.display = 'block';
    document.getElementById('noteEditor').classList.remove('active');
    document.getElementById('noteActions').style.display = 'flex';
    document.getElementById('editingActions').style.display = 'none';
}

/**
 * Clear saved note
 */
function clearNote() {
    if (confirm('Are you sure you want to clear the note?')) {
        savedNote = '';
        localStorage.removeItem('billingSavedNote');
        displayNote();
        document.getElementById('clearNoteBtn').style.display = 'none';
        showSuccess('Note cleared!', 2000);
    }
}

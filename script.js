document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const buttons = document.querySelectorAll('.ribbon-group button[data-command]');
  const fontNameSelect = document.getElementById('fontName');
  const fontSizeInput = document.getElementById('fontSize');
  const colorPicker = document.getElementById('colorPicker');
  const bgColorPicker = document.getElementById('bgColorPicker');
  const htmlOutput = document.getElementById('html-output');
  const fileInput = document.getElementById('fileInput');
  const fileTab = document.querySelector('.file-tab');
  const fileMenu = document.querySelector('.file-menu');
  const contextMenu = document.getElementById('context-menu');
  const aboutModal = document.getElementById('about-modal');
  const closeModal = document.querySelector('.close-modal');
  const toggleDarkMode = document.getElementById('toggleDarkMode');
  const toggleFullscreen = document.getElementById('toggleFullscreen');
  const resizeHandle = document.querySelector('.resize-handle');
  const outputContainer = document.querySelector('.output-container');
  const copyOutputBtn = document.getElementById('copyOutput');
  const toggleOutputBtn = document.querySelectorAll('#toggleOutput');
  const ribbonTabs = document.querySelectorAll('.ribbon-tab');
  const ribbonPanels = document.querySelectorAll('.ribbon-panel');
  
  let isResizing = false;
  let startY;
  let startHeight;
  
  // Initialize
  updateHtmlOutput();
  
  // Set focus to editor
  editor.focus();
  
  // File menu toggle
  fileTab.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileMenu.classList.toggle('active');
    fileTab.classList.toggle('file-menu-open');
  });
  
  // Close file menu when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!fileTab.contains(e.target) && !fileMenu.contains(e.target)) {
      fileMenu.classList.remove('active');
      fileTab.classList.remove('file-menu-open');
    }
  });
  
  // File menu actions
  document.querySelectorAll('.file-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      
      switch(action) {
        case 'new':
          if (confirm('Are you sure you want to create a new file? Any unsaved changes will be lost.')) {
            editor.innerHTML = '';
            updateHtmlOutput();
          }
          break;
        case 'open':
          fileInput.click();
          break;
        case 'save':
          saveFile();
          break;
        case 'saveAs':
          saveFile(true);
          break;
        case 'print':
          printDocument();
          break;
        case 'about':
          aboutModal.classList.add('active');
          break;
      }
      
      fileMenu.classList.remove('active');
      fileTab.classList.remove('file-menu-open');
    });
  });
  
  // Print only the editor content
  function printDocument() {
    const printWindow = window.open('', '_blank');
    const content = editor.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div>${content}</div>
        <script>
          window.onload = function() {
            window.print();
            window.onfocus = function() {
              window.close();
            };
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Check if it's an HTML file
        if (file.type === 'text/html' || file.name.endsWith('.html')) {
          // Extract content between body tags if possible
          const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(content);
          if (bodyMatch && bodyMatch[1]) {
            editor.innerHTML = bodyMatch[1].trim();
          } else {
            editor.innerHTML = content;
          }
        } else {
          // Plain text
          editor.innerText = content;
        }
        updateHtmlOutput();
        editor.focus();
      };
      reader.readAsText(file);
    }
    // Reset file input to allow selecting the same file again
    fileInput.value = '';
  });
  
  // Close modal
  closeModal.addEventListener('click', () => {
    aboutModal.classList.remove('active');
  });
  
  // Close modal when clicking outside
  aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
      aboutModal.classList.remove('active');
    }
  });
  
  // Dark mode toggle
  toggleDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });
  
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  // Fullscreen toggle
  toggleFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
  
  // Toggle Output functionality
  toggleOutputBtn.forEach(btn => {
    btn.addEventListener('click', () => {
      if (outputContainer.style.display === 'none') {
        outputContainer.style.display = 'flex';
        updateHtmlOutput();
      } else {
        outputContainer.style.display = 'none';
      }
    });
  });
  
  // Resize output area
  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = outputContainer.offsetHeight;
    document.body.style.cursor = 'ns-resize';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const height = startHeight - (e.clientY - startY);
    if (height > 100) {
      outputContainer.style.height = `${height}px`;
    }
  });
  
  document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = '';
  });
  
  // Context menu
  editor.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.add('active');
  });
  
  document.addEventListener('click', () => {
    contextMenu.classList.remove('active');
  });
  
  // Request clipboard permissions at startup if available
  function requestClipboardPermission() {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'clipboard-read' }).then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {
          console.log('Clipboard read permission:', result.state);
        }
      }).catch(err => {
        console.log('Clipboard permission API not available');
      });
    }
  }
  
  // Try to request permission early
  requestClipboardPermission();
  
  // Create a universal paste function that can be used throughout the application
  function performPaste() {
    // First try using the Clipboard API (modern browsers)
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText()
        .then(text => {
          document.execCommand('insertText', false, text);
          updateHtmlOutput();
        })
        .catch(err => {
          console.error('Failed to read clipboard: ', err);
          
          // If failed, try the fallback execCommand method
          try {
            // Focus editor to ensure paste works
            editor.focus();
            document.execCommand('paste', false);
            updateHtmlOutput();
          } catch (e) {
            console.error('Paste fallback failed:', e);
            alert('Unable to paste. Please try using Ctrl+V keyboard shortcut.');
          }
        });
    } else {
      // Fallback for browsers without Clipboard API
      try {
        editor.focus();
        document.execCommand('paste', false);
        updateHtmlOutput();
      } catch (e) {
        console.error('Paste command failed:', e);
        alert('Unable to paste. Please try using Ctrl+V keyboard shortcut.');
      }
    }
  }
  
  // Context menu actions
  document.querySelectorAll('.context-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const command = item.dataset.command;
      
      if (command === 'paste') {
        performPaste();
      } else {
        document.execCommand(command, false, null);
        updateHtmlOutput();
      }
      
      contextMenu.classList.remove('active');
    });
  });
  
  // Font preview
  fontNameSelect.addEventListener('change', () => {
    if (fontNameSelect.value) {
      document.execCommand('fontName', false, fontNameSelect.value);
      editor.focus();
      updateHtmlOutput();
    }
  });
  
  // Custom font size
  fontSizeInput.addEventListener('change', () => {
    const size = parseInt(fontSizeInput.value, 10);
    if (!isNaN(size) && size >= 1 && size <= 72) {
      document.execCommand('fontSize', false, size);
      editor.focus();
      updateHtmlOutput();
      
      // Update button states
      updateFontSizeButtonsState();
    } else {
      // If invalid, reset to default
      fontSizeInput.value = 3;
      updateFontSizeButtonsState();
    }
  });
  
  // Add font size increment/decrement controls
  const fontSizeContainer = fontSizeInput.parentElement;
  
  // Create container for font size controls
  const fontSizeControlsContainer = document.createElement('div');
  fontSizeControlsContainer.className = 'font-size-controls';
  
  // Add increment button (plus sign, should be at the top)
  const incrementFontSizeBtn = document.createElement('button');
  incrementFontSizeBtn.className = 'font-size-btn increment';
  incrementFontSizeBtn.title = 'Increase font size';
  incrementFontSizeBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
  incrementFontSizeBtn.addEventListener('click', () => {
    // Get current font size
    let currentSize = parseInt(fontSizeInput.value, 10);
    
    // Increment size
    currentSize = (isNaN(currentSize) ? 3 : currentSize + 1);
    
    // Cap at maximum 72
    currentSize = Math.min(72, currentSize);
    
    // Update input
    fontSizeInput.value = currentSize;
    
    // Apply new size
    document.execCommand('fontSize', false, currentSize);
    editor.focus();
    updateHtmlOutput();
    
    // Update button states
    updateFontSizeButtonsState();
  });
  
  // Add decrement button (minus sign, should be at the bottom)
  const decrementFontSizeBtn = document.createElement('button');
  decrementFontSizeBtn.className = 'font-size-btn decrement';
  decrementFontSizeBtn.title = 'Decrease font size';
  decrementFontSizeBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
  decrementFontSizeBtn.addEventListener('click', () => {
    // Get current font size
    let currentSize = parseInt(fontSizeInput.value, 10);
    
    // Decrement size
    currentSize = (isNaN(currentSize) ? 3 : currentSize - 1);
    
    // Ensure minimum of 1
    currentSize = Math.max(1, currentSize);
    
    // Update input
    fontSizeInput.value = currentSize;
    
    // Apply new size
    document.execCommand('fontSize', false, currentSize);
    editor.focus();
    updateHtmlOutput();
    
    // Update button states
    updateFontSizeButtonsState();
  });
  
  // Create a wrapper for the input and controls
  const fontSizeWrapper = document.createElement('div');
  fontSizeWrapper.className = 'font-size-wrapper';
  
  // Move the fontSizeInput to our new wrapper
  fontSizeInput.parentNode.insertBefore(fontSizeWrapper, fontSizeInput);
  fontSizeWrapper.appendChild(fontSizeInput);
  
  // Clear and add buttons to controls container in correct order
  fontSizeControlsContainer.innerHTML = ''; // Clear any existing content
  fontSizeControlsContainer.appendChild(incrementFontSizeBtn); // Plus sign at the top
  fontSizeControlsContainer.appendChild(decrementFontSizeBtn); // Minus sign at the bottom
  
  // Add controls to wrapper
  fontSizeWrapper.appendChild(fontSizeControlsContainer);
  
  // Add CSS for font size controls
  const styleForFontSizeControls = document.createElement('style');
  styleForFontSizeControls.textContent = `
    .font-size-wrapper {
        position: relative;
        display: inline-block;
    }
    
    .font-size-controls {
        position: absolute;
        right: 2px;
        top: 2px;
        height: calc(100% - 4px);
        display: flex;
        flex-direction: column;
        z-index: 5;
    }
    
    .font-size-btn {
        width: 12px !important;
        height: 16px !important;
        padding: 0 !important;
        margin: 0 !important;
        font-size: 8px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        cursor: pointer;
    }
    
    .font-size-btn:hover {
        background-color: #e0e0e0;
    }
    
    .font-size-btn.increment {
        border-top-right-radius: 3px;
        border-bottom: none;
    }
    
    .font-size-btn.decrement {
        border-bottom-right-radius: 3px;
    }
    
    .dark-mode .font-size-btn {
        background-color: #444;
        border-color: #555;
        color: #fff;
    }
    
    .dark-mode .font-size-btn:hover {
        background-color: #555;
    }
    
    /* Adjust the input to make room for buttons */
    .font-size-input {
        padding-right: 15px !important;
    }
    
    /* Hide default spinner buttons */
    .font-size-input::-webkit-inner-spin-button, 
    .font-size-input::-webkit-outer-spin-button { 
        -webkit-appearance: none;
        margin: 0;
    }
    
    /* For Firefox */
    .font-size-input {
        -moz-appearance: textfield;
    }
    
    .font-size-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .font-size-btn.disabled:hover {
        background-color: #f5f5f5 !important;
    }
    
    .dark-mode .font-size-btn.disabled:hover {
        background-color: #444 !important;
    }
  `;
  document.head.appendChild(styleForFontSizeControls);
  
  // Color pickers with labels
  colorPicker.addEventListener('input', () => {
    document.execCommand('foreColor', false, colorPicker.value);
    editor.focus();
    updateHtmlOutput();
  });
  
  // Add double-click to reset text color
  colorPicker.addEventListener('dblclick', () => {
    // Set to default black color
    colorPicker.value = '#000000';
    document.execCommand('foreColor', false, 'black');
    editor.focus();
    updateHtmlOutput();
  });
  
  bgColorPicker.addEventListener('input', () => {
    document.execCommand('hiliteColor', false, bgColorPicker.value);
    editor.focus();
    updateHtmlOutput();
  });
  
  // Add double-click to reset background color
  bgColorPicker.addEventListener('dblclick', () => {
    // Reset background color by applying transparent background
    document.execCommand('hiliteColor', false, 'transparent');
    editor.focus();
    updateHtmlOutput();
  });
  
  // Add reset color buttons
  const colorPickerContainer = colorPicker.parentElement;
  const bgColorPickerContainer = bgColorPicker.parentElement;
  
  // Add reset text color button
  const resetTextColorBtn = document.createElement('button');
  resetTextColorBtn.className = 'reset-color-btn';
  resetTextColorBtn.title = 'Reset text color';
  resetTextColorBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
  resetTextColorBtn.addEventListener('click', () => {
    colorPicker.value = '#000000';
    document.execCommand('foreColor', false, 'black');
    editor.focus();
    updateHtmlOutput();
  });
  colorPickerContainer.appendChild(resetTextColorBtn);
  
  // Add reset background color button
  const resetBgColorBtn = document.createElement('button');
  resetBgColorBtn.className = 'reset-color-btn';
  resetBgColorBtn.title = 'Reset background color';
  resetBgColorBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
  resetBgColorBtn.addEventListener('click', () => {
    document.execCommand('hiliteColor', false, 'transparent');
    editor.focus();
    updateHtmlOutput();
  });
  bgColorPickerContainer.appendChild(resetBgColorBtn);
  
  // Add CSS for reset color buttons
  const styleForResetButtons = document.createElement('style');
  styleForResetButtons.textContent = `
    .color-picker-container {
        position: relative;
    }
    
    .reset-color-btn {
        position: absolute;
        top: 0;
        right: 0;
        width: 16px !important;
        height: 16px !important;
        border-radius: 50%;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        cursor: pointer;
        padding: 0;
        z-index: 10;
    }
    
    .reset-color-btn:hover {
        background-color: #e0e0e0;
    }
    
    .dark-mode .reset-color-btn {
        background-color: #555;
        border-color: #666;
        color: #fff;
    }
    
    .dark-mode .reset-color-btn:hover {
        background-color: #666;
    }
  `;
  document.head.appendChild(styleForResetButtons);
  
  // Copy output to clipboard
  copyOutputBtn.addEventListener('click', () => {
    htmlOutput.select();
    document.execCommand('copy');
    const originalText = copyOutputBtn.innerHTML;
    copyOutputBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
      copyOutputBtn.innerHTML = originalText;
    }, 2000);
  });
  
  // Ribbon tab switching
  ribbonTabs.forEach(tab => {
    if (tab.classList.contains('file-tab')) return; // Skip the file tab
    
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.tab;
      
      // Close file menu if open
      fileMenu.classList.remove('active');
      fileTab.classList.remove('file-menu-open');
      
      // Update active states
      ribbonTabs.forEach(t => t.classList.remove('active'));
      ribbonPanels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.querySelector(`.ribbon-panel[data-panel="${targetPanel}"]`).classList.add('active');
    });
  });
  
  // Set initial state of undo/redo buttons
  const undoButton = document.querySelector('button[data-command="undo"]');
  const redoButton = document.querySelector('button[data-command="redo"]');
  
  // Disable undo button initially as there's nothing to undo yet
  undoButton.disabled = true;
  undoButton.classList.add('disabled');
  
  // Disable redo button initially as there's nothing to redo
  redoButton.disabled = true;
  redoButton.classList.add('disabled');
  
  // Track undo/redo state
  let undoStack = [];
  let redoStack = [];
  let lastContent = editor.innerHTML;
  
  // Update undo/redo buttons state
  function updateUndoRedoState() {
    // Check if undo is available
    undoButton.disabled = undoStack.length === 0;
    undoButton.classList.toggle('disabled', undoStack.length === 0);
    
    // Check if redo is available
    redoButton.disabled = redoStack.length === 0;
    redoButton.classList.toggle('disabled', redoStack.length === 0);
  }
  
  // Add current state to undo stack
  function saveCurrentState() {
    const currentContent = editor.innerHTML;
    if (currentContent !== lastContent) {
      undoStack.push(lastContent);
      lastContent = currentContent;
      redoStack = []; // Clear redo stack when new change is made
      
      // Limit stack size to prevent memory issues
      if (undoStack.length > 100) {
        undoStack.shift();
      }
      
      updateUndoRedoState();
    }
  }
  
  // Handle undo action
  function performUndo() {
    if (undoStack.length > 0) {
      redoStack.push(lastContent);
      lastContent = undoStack.pop();
      editor.innerHTML = lastContent;
      updateHtmlOutput();
      updateUndoRedoState();
    }
  }
  
  // Handle redo action
  function performRedo() {
    if (redoStack.length > 0) {
      undoStack.push(lastContent);
      lastContent = redoStack.pop();
      editor.innerHTML = lastContent;
      updateHtmlOutput();
      updateUndoRedoState();
    }
  }
  
  // Track editor changes to update undo/redo state
  editor.addEventListener('input', () => {
    saveCurrentState();
    updateHtmlOutput();
  });
  
  // Track commands that should update undo state
  editor.addEventListener('keydown', (e) => {
    // Save state before certain key combinations
    if (e.ctrlKey || e.metaKey || e.key === 'Delete' || e.key === 'Backspace') {
      setTimeout(saveCurrentState, 0);
    }
  });
  
  // Attach event listeners to buttons
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const command = button.dataset.command;
      const value = button.dataset.value;
      
      if (command === 'undo') {
        performUndo();
      } else if (command === 'redo') {
        performRedo();
      } else if (command === 'createLink') {
        const url = prompt('Enter the link URL:', 'https://');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (command === 'insertImage') {
        const url = prompt('Enter the image URL:', 'https://');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (command === 'paste') {
        performPaste();
      } else if (command === 'insertTable') {
        const rows = prompt('Enter number of rows:', '3');
        const cols = prompt('Enter number of columns:', '3');
        if (rows && cols) {
          const table = document.createElement('table');
          table.border = '1';
          for (let i = 0; i < rows; i++) {
            const row = table.insertRow();
            for (let j = 0; j < cols; j++) {
              row.insertCell();
            }
          }
          document.execCommand('insertHTML', false, table.outerHTML);
        }
      } else if (command === 'insertHorizontalRule') {
        document.execCommand('insertHTML', false, '<hr>');
      } else if (command === 'insertEmoji') {
        const emoji = prompt('Enter emoji:', '😊');
        if (emoji) {
          document.execCommand('insertText', false, emoji);
        }
      } else if (command === 'insertDate') {
        document.execCommand('insertText', false, new Date().toLocaleDateString());
      } else if (command === 'insertTime') {
        document.execCommand('insertText', false, new Date().toLocaleTimeString());
      } else if (command === 'formatBlock') {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, null);
      }
      
      // Update state for commands that modify content
      if (command !== 'undo' && command !== 'redo' && command !== 'copy' && 
          command !== 'selectAll' && command !== 'paste') {
        setTimeout(saveCurrentState, 0);
      }
      
      updateActiveState();
      updateHtmlOutput();
    });
  });
  
  // Update HTML output - fix formatting issues with whitespace
  function updateHtmlOutput() {
    // Get the raw HTML
    const rawHtml = editor.innerHTML;
    
    // Format the HTML for display by removing extra spaces and indentation
    const formattedHtml = rawHtml
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace
      
    htmlOutput.value = formattedHtml;
  }
  
  // Update active state of buttons
  function updateActiveState() {
    buttons.forEach(button => {
      const command = button.dataset.command;
      
      if (document.queryCommandState(command)) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  // Save file function
  function saveFile(saveAs = false) {
    const content = editor.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Listen for keyboard shortcuts
  editor.addEventListener('keydown', (e) => {
    // Bold: Ctrl+B
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      updateActiveState();
      updateHtmlOutput();
    }
    
    // Italic: Ctrl+I
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
      updateActiveState();
      updateHtmlOutput();
    }
    
    // Underline: Ctrl+U
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
      updateActiveState();
      updateHtmlOutput();
    }
    
    // Save: Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
    
    // Save As: Ctrl+Shift+S
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      saveFile(true);
    }
    
    // New: Ctrl+N
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      if (confirm('Are you sure you want to create a new file? Any unsaved changes will be lost.')) {
        editor.innerHTML = '';
        updateHtmlOutput();
      }
    }
    
    // Open: Ctrl+O
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      fileInput.click();
    }
    
    // Print: Ctrl+P
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      printDocument();
    }
  });
  
  // Update active state when selection changes
  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editor) {
      updateActiveState();
      updateFormatControls();
    }
  });
  
  // Handle paste events more robustly
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    
    // Get pasted data via clipboard API
    const clipboardData = e.clipboardData || window.clipboardData;
    if (clipboardData && clipboardData.getData) {
      const text = clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
      updateHtmlOutput();
    } else {
      // If clipboard data isn't accessible from the event,
      // try the global paste function as a last resort
      performPaste();
    }
  });
  
  // Update format controls (font, size, colors) based on current selection
  function updateFormatControls() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (!range) return;
    
    // Get the current node at the cursor or selection
    let currentNode = range.commonAncestorContainer;
    
    // If it's a text node, get its parent
    if (currentNode.nodeType === 3) {
      currentNode = currentNode.parentNode;
    }
    
    // Get computed styles of the current node
    const computedStyle = window.getComputedStyle(currentNode);
    
    // Update font family
    const fontFamily = computedStyle.fontFamily.split(',')[0].replace(/["']/g, '');
    updateFontSelect(fontFamily);
    
    // Update font size
    let fontSize = computedStyle.fontSize;
    // Convert px to pt (approximate conversion)
    if (fontSize.endsWith('px')) {
      const pxSize = parseFloat(fontSize);
      // Convert px to a font size value (1-7) or use actual pt value
      fontSize = convertPxToFontSize(pxSize);
    }
    updateFontSizeInput(fontSize);
    
    // Update text color
    const textColor = rgbToHex(computedStyle.color);
    colorPicker.value = textColor;
    
    // Update background color
    let bgColor = computedStyle.backgroundColor;
    if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      bgColorPicker.value = rgbToHex(bgColor);
    }
  }
  
  // Helper function to update font select
  function updateFontSelect(fontFamily) {
    const options = fontNameSelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value && fontFamily.toLowerCase().includes(options[i].value.toLowerCase())) {
        fontNameSelect.selectedIndex = i;
        return;
      }
    }
    // If not found, default to first option
    fontNameSelect.selectedIndex = 0;
  }
  
  // Helper function to update font size input
  function updateFontSizeInput(fontSize) {
    // Handle different font size formats
    let size;
    
    if (typeof fontSize === 'number') {
        size = fontSize;
    } else if (fontSize.endsWith('px')) {
        // Convert px to pt (approximate)
        const px = parseFloat(fontSize);
        const pt = Math.round(px * 0.75);
        size = pt;
    } else if (fontSize.endsWith('pt')) {
        size = parseFloat(fontSize);
    } else {
        // Try to parse as a number
        size = parseFloat(fontSize);
        if (isNaN(size)) {
            // Default size if parsing fails
            size = 3;
        }
    }
    
    // Ensure size is within valid range
    size = Math.max(1, Math.min(72, size));
    
    // Update the input value
    fontSizeInput.value = size;
    
    // Also update any UI that depends on font size
    updateFontSizeButtonsState();
  }
  
  // Function to update font size buttons state
  function updateFontSizeButtonsState() {
    const currentSize = parseInt(fontSizeInput.value, 10);
    
    // Update increment button state
    if (currentSize >= 72) {
        incrementFontSizeBtn.classList.add('disabled');
        incrementFontSizeBtn.disabled = true;
    } else {
        incrementFontSizeBtn.classList.remove('disabled');
        incrementFontSizeBtn.disabled = false;
    }
    
    // Update decrement button state
    if (currentSize <= 1) {
        decrementFontSizeBtn.classList.add('disabled');
        decrementFontSizeBtn.disabled = true;
    } else {
        decrementFontSizeBtn.classList.remove('disabled');
        decrementFontSizeBtn.disabled = false;
    }
  }
  
  // Convert pixel size to font size (1-7) or actual pt value
  function convertPxToFontSize(px) {
    // This is a rough approximation
    if (px <= 10) return 1;
    if (px <= 13) return 2;
    if (px <= 16) return 3;
    if (px <= 18) return 4;
    if (px <= 24) return 5;
    if (px <= 32) return 6;
    return 7;
  }
  
  // Convert RGB to Hex color
  function rgbToHex(rgb) {
    // Check if this is a standard RGB format
    const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
    const rgbaRegex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/;
    
    let match = rgb.match(rgbRegex) || rgb.match(rgbaRegex);
    
    if (!match) return '#000000'; // Default to black if not matching
    
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  // Update format controls on mouseup to catch selections made by mouse
  editor.addEventListener('mouseup', updateFormatControls);
  
  // Initial update of format controls
  updateFormatControls();
  
  // Initialize font size button states
  updateFontSizeButtonsState();
}); 
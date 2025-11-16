// --- 1. CONFIGURATION ---

const CORRECT_PASSWORD = "admin123"; 
const COMPANY_NAME = "TRUE ORIGIN FOODS";
const CURRENCY_SYMBOL = '₹';

// Default product list 
const defaultProducts = [
    { item: "CREAM BUN", price: 17.00, category: "Breads & Buns" },
    { item: "JAM BUN", price: 16.00, category: "Breads & Buns" },
    { item: "COCONUT BUN small", price: 17.00, category: "Breads & Buns" },
    { item: "BURGER BUN", price: 14.00, category: "Breads & Buns" },
    { item: "JAM ROLL", price: 17.00, category: "Breads & Buns" },
    { item: "CHOCO DONUT", price: 18.00, category: "Breads & Buns" },
    { item: "SPECIAL BUN", price: 13.00, category: "Breads & Buns" },
    { item: "TEA BUN 60gm", price: 8.00, category: "Breads & Buns" },

    { item: "TEA CAKE", price: 10.00, category: "Cakes & Muffins" },
    { item: "PUDDING CAKE", price: 17.00, category: "Cakes & Muffins" },
    { item: "BROWNIE", price: 45.00, category: "Cakes & Muffins" },
    { item: "CHOCO LAVA", price: 40.00, category: "Cakes & Muffins" },
    { item: "PLAIN MUFFIN", price: 20.00, category: "Cakes & Muffins" },
    { item: "FRUIT MUFFIN", price: 22.00, category: "Cakes & Muffins" },
    { item: "CHOCO CHIP MUFFIN", price: 24.00, category: "Cakes & Muffins" },
    { item: "PURE CHOC MUFFIN", price: 26.00, category: "Cakes & Muffins" },
    { item: "VANILLA WONDER CAKE", price: 45.00, category: "Cakes & Muffins" },
    { item: "FRUIT WONDER CAKE", price: 45.00, category: "Cakes & Muffins" },
    { item: "PINEAPPLE WONDER CAKE", price: 45.00, category: "Cakes & Muffins" },
    { item: "CHOCO WONDER CAKE", price: 45.00, category: "Cakes & Muffins" },

    { item: "VEG PUFF", price: 17.00, category: "Hot Snacks" },
    { item: "MUSHROOM PUFF", price: 19.00, category: "Hot Snacks" },
    { item: "EGG PUFF", price: 18.50, category: "Hot Snacks" },
    { item: "PANEER PUFF", price: 19.00, category: "Hot Snacks" },
    { item: "VEG ROLL", price: 23.00, category: "Hot Snacks" },
    { item: "MUSHROOM ROLL", price: 25.00, category: "Hot Snacks" },
];

let currentQuoteItems = [...defaultProducts]; 

// --- 2. LOGIN LOGIC ---

document.getElementById('login-button').addEventListener('click', () => {
    const input = document.getElementById('password-input').value;
    const message = document.getElementById('login-message');
    
    if (input === CORRECT_PASSWORD) {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        initializeApp();
    } else {
        message.textContent = "Invalid password. Please try again.";
    }
});

// --- 3. APPLICATION INITIALIZATION ---

function initializeApp() {
    const today = new Date();
    document.getElementById('output-date').textContent = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    document.getElementById('customer-name').addEventListener('input', updateCustomerName);
    document.getElementById('default-margin').addEventListener('input', updateAllMargin);
    document.getElementById('export-pdf-button').addEventListener('click', () => exportQuote('pdf'));
    document.getElementById('export-image-button').addEventListener('click', () => exportQuote('png'));
    
    const addCategoryButton = document.getElementById('add-category-button');
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', promptForNewCategory);
    }
    
    renderQuoteTable();
}

// --- 4. CORE FUNCTIONALITY ---

function updateCustomerName(event) {
    document.getElementById('output-customer-name').textContent = event.target.value;
}

function updateAllMargin(event) {
    const newMargin = parseFloat(event.target.value);
    if (isNaN(newMargin) || newMargin < 0) return;

    currentQuoteItems.forEach(item => {
        const marginInput = document.getElementById(`margin-${item.id}`);
        if (marginInput) {
            marginInput.value = newMargin.toFixed(2);
        }
        item.margin = newMargin;
        // Trigger calculation to update RRP based on new Margin
        calculateItemRow(item.id, 'margin');
    });
}

// Renders the entire table from the currentQuoteItems array, grouped by category
function renderQuoteTable() {
    const tableBody = document.getElementById('quote-table-body');
    tableBody.innerHTML = ''; 

    const defaultMargin = parseFloat(document.getElementById('default-margin').value) || 30;

    const sortedItems = [...currentQuoteItems].sort((a, b) => {
        if (a.category && b.category) {
            return a.category.localeCompare(b.category);
        }
        if (a.category) return -1; 
        if (b.category) return 1;
        return 0; 
    });

    let currentCategory = null;

    sortedItems.forEach((item, index) => {
        if (!item.id) item.id = Date.now() + index;
        if (item.margin === undefined) item.margin = defaultMargin;
        // Ensure RRP is initialized/calculated
        if (item.rrp === undefined) {
             item.rrp = item.price / (1 - item.margin / 100);
        }

        if (item.category && item.category !== currentCategory) {
            if (currentCategory !== null) {
                renderAddLineButton(currentCategory);
            }
            const categoryRow = tableBody.insertRow();
            const categoryCell = categoryRow.insertCell();
            categoryCell.colSpan = 5; 
            categoryCell.className = 'category-header';
            categoryCell.textContent = item.category;
            currentCategory = item.category;
        }
        
        renderItemRow(item);
    });

    if (currentCategory !== null) {
        renderAddLineButton(currentCategory);
    }
}

// Renders the "Add New Product Line" button row
function renderAddLineButton(category) {
    const tableBody = document.getElementById('quote-table-body');
    const addLineRow = tableBody.insertRow();
    addLineRow.className = 'add-line-btn-row'; 
    
    const buttonCell = addLineRow.insertCell();
    buttonCell.colSpan = 5;
    
    buttonCell.innerHTML = `<button class="neumorphic-btn secondary-btn" onclick="addNewItem('${category}')">➕ Add Product Line to ${category}</button>`;
}

// Renders a single item row with inputs
function renderItemRow(item) {
    const tableBody = document.getElementById('quote-table-body');
    const newRow = tableBody.insertRow();
    newRow.id = `row-${item.id}`;
    newRow.setAttribute('data-category', item.category || 'Custom');

    // Add event listeners for row highlighting
    newRow.addEventListener('focusin', () => newRow.classList.add('active-row'));
    newRow.addEventListener('focusout', () => newRow.classList.remove('active-row'));

    // 1. Item Name (Left Align)
    const itemCell = newRow.insertCell();
    itemCell.className = 'item-col align-left';
    itemCell.innerHTML = `<input type="text" id="item-${item.id}" value="${item.item}" class="neumorphic-input align-left" oninput="updateItemData(${item.id}, 'item', this.value)">`;

    // 2. Wholesale Price (WP) (Right Align) - type="tel" for mobile number pad
    const wpCell = newRow.insertCell();
    wpCell.className = 'price-col align-right';
    // Use item.price for display, and pass 'price' key
    wpCell.innerHTML = `<input type="tel" id="price-${item.id}" value="${item.price.toFixed(2)}" min="0.01" step="0.50" class="neumorphic-input price-input align-right" data-key="price" oninput="calculateItemRow(${item.id}, 'price')">`;

    // 3. Retailer Margin (%) (Center Align) - type="tel" for mobile number pad
    const marginCell = newRow.insertCell();
    marginCell.className = 'margin-col align-center';
    // Use item.margin for display, and pass 'margin' key
    marginCell.innerHTML = `<input type="tel" id="margin-${item.id}" value="${item.margin.toFixed(2)}" min="0" max="100" step="0.01" class="neumorphic-input margin-input align-center" data-key="margin" oninput="calculateItemRow(${item.id}, 'margin')">`;

    // 4. Recommended Retail Price (RRP) (Right Align) - type="tel" for mobile number pad
    const rrpCell = newRow.insertCell();
    rrpCell.className = 'price-col align-right';
    // Use item.rrp for display, and pass 'rrp' key
    rrpCell.innerHTML = `<input type="tel" id="rrp-${item.id}" value="${item.rrp ? item.rrp.toFixed(2) : ''}" min="0.01" step="0.50" class="neumorphic-input price-input align-right" data-key="rrp" oninput="calculateItemRow(${item.id}, 'rrp')">`;
    
    // 5. Remove Button (Center Align)
    const actionCell = newRow.insertCell();
    actionCell.className = 'action-col align-center';
    actionCell.innerHTML = `<button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>`;

    // Initial calculation to populate RRP (This is necessary because initial RRP value is calculated on load)
    calculateItemRow(item.id, 'margin'); 
}

function updateItemData(itemId, key, value) {
    const item = currentQuoteItems.find(i => i.id == itemId);
    if (!item) return;
    item[key] = value; 
}

// --- 5. DYNAMIC 2-OF-3 CALCULATION LOGIC (SIMPLIFIED) ---

function calculateItemRow(itemId, lastChangedKey) {
    const item = currentQuoteItems.find(i => i.id == itemId);
    if (!item) return;

    const wpInput = document.getElementById(`price-${itemId}`);
    const rrpInput = document.getElementById(`rrp-${itemId}`);
    const marginInput = document.getElementById(`margin-${itemId}`);

    // Update internal item data from inputs immediately for the changed key
    item.price = parseFloat(wpInput.value) || 0;
    item.rrp = parseFloat(rrpInput.value) || 0;
    item.margin = parseFloat(marginInput.value) || 0;

    const wp = item.price;
    const rrp = item.rrp;
    const margin = item.margin;
    
    let calculatedValue = NaN;
    let targetInput = null;
    let targetKey = null;

    // RULE 1 & 3: WP or RRP changed -> Calculate Margin
    // Must have WP and RRP, and RRP must be > WP
    if (lastChangedKey === 'price' || lastChangedKey === 'rrp') {
        if (wp > 0 && rrp > wp) {
            // Formula: Margin = (1 - (WP / RRP)) * 100
            calculatedValue = (1 - (wp / rrp)) * 100;
            targetInput = marginInput;
            targetKey = 'margin';
            // Update internal model immediately
            item.margin = calculatedValue;
            
            // If WP was changed, we must update RRP based on the newly calculated margin 
            // to keep the RRP field consistent with the W.P. & Margin.
            if (lastChangedKey === 'price' && calculatedValue >= 0 && calculatedValue < 100) {
                 const newRRP = wp / (1 - calculatedValue / 100);
                 rrpInput.value = newRRP.toFixed(2);
                 item.rrp = newRRP;
            }
            
        } else if (wp > 0 && rrp <= wp) {
            // RRP is too low, Margin must be 0 or negative
            calculatedValue = 0.00;
            targetInput = marginInput;
            targetKey = 'margin';
            item.margin = calculatedValue;

        } else if (wp === 0) {
            // If WP is cleared, clear Margin and RRP
             marginInput.value = "0.00";
             rrpInput.value = "0.00";
             item.margin = 0;
             item.rrp = 0;
             return;
        } else {
             marginInput.value = "0.00";
             item.margin = 0;
             return;
        }
    } 
    
    // RULE 2: Margin changed -> Calculate RRP
    else if (lastChangedKey === 'margin' && wp > 0 && margin >= 0 && margin < 100) {
        // Formula: RRP = WP / (1 - Margin / 100)
        calculatedValue = wp / (1 - margin / 100);
        targetInput = rrpInput;
        targetKey = 'rrp';
        item.rrp = calculatedValue;
    }
    
    // Apply calculated value to the target input
    if (targetInput && isFinite(calculatedValue)) {
        targetInput.value = calculatedValue.toFixed(2);
        item[targetKey] = parseFloat(targetInput.value); // Store the final rounded value in the item
    }
}


// --- 6. ADD CATEGORY / ADD ITEM LOGIC ---

function promptForNewCategory() {
    const categoryName = prompt("Please enter the name for the new category (e.g., Seasonal Items):");
    if (categoryName && categoryName.trim()) {
        addNewCategory(categoryName.trim());
    }
}

function addNewCategory(category) {
    const defaultMargin = parseFloat(document.getElementById('default-margin').value) || 30;
    
    const newItem = { 
        item: "New Custom Product", 
        price: 0.00, 
        margin: defaultMargin,
        category: category,
        id: Date.now() 
    };
    // Calculate RRP for the new item
    newItem.rrp = newItem.price / (1 - newItem.margin / 100); 

    currentQuoteItems.push(newItem);
    
    renderQuoteTable(); 
}

function addNewItem(category = 'Custom') {
    const defaultMargin = parseFloat(document.getElementById('default-margin').value) || 30;
    const newItem = { 
        item: "New Custom Product", 
        price: 0.00, 
        margin: defaultMargin,
        category: category,
        id: Date.now() 
    };
    // Calculate RRP for the new item
    newItem.rrp = newItem.price / (1 - newItem.margin / 100); 

    const lastItemIndex = currentQuoteItems.map(i => i.category).lastIndexOf(category);
    
    if (lastItemIndex !== -1) {
        currentQuoteItems.splice(lastItemIndex + 1, 0, newItem);
    } else {
        currentQuoteItems.push(newItem); 
    }

    renderQuoteTable(); 
}

function removeItem(itemId) {
    currentQuoteItems = currentQuoteItems.filter(item => item.id !== itemId);
    renderQuoteTable(); 
}

// Helper function for confirmation popup
function showExportConfirmation(type) {
    alert(`✅ Quote successfully exported as a ${type.toUpperCase()}!`);
}

// --- 7. EXPORT LOGIC (FIXED FOR HIDING MARGIN & ACTION COLUMNS) ---

async function exportQuote(type) {
    const controlsPanel = document.getElementById('controls-panel');
    const exportButtons = document.getElementById('export-buttons');
    const exportedCustomPlaceholder = document.getElementById('exported-custom-item-placeholder');
    const addCategoryArea = document.getElementById('add-category-area'); 
    const tableBody = document.getElementById('quote-table-body');
    const addLineButtons = document.querySelectorAll('.add-line-btn-row'); 
    const quoteTable = document.getElementById('quote-table'); // Get the main table element
    
    // --- Logic: Check if Margin Column needs to be hidden ---
    const hideMarginControl = document.getElementById('hide-margin-checkbox');
    const hideMargin = hideMarginControl ? hideMarginControl.checked : false;

    // --- STEP 1: PREP UI for Export ---
    controlsPanel.style.display = 'none';
    exportButtons.style.display = 'none';
    if (addCategoryArea) addCategoryArea.style.display = 'none';
    addLineButtons.forEach(row => row.style.display = 'none');
    exportedCustomPlaceholder.classList.remove('hidden');

    // Hide Action column (Remove buttons)
    document.querySelectorAll('#quote-table th.action-col').forEach(th => th.style.display = 'none');
    document.querySelectorAll('.action-col').forEach(col => col.style.display = 'none');
    
    // Apply the special CSS class for table column sizing if margin is hidden
    if (hideMargin) {
        quoteTable.classList.add('col-hidden-margin-action');
    }

    // --- STEP 2: Convert Inputs to Static Text ---
    const inputsToRestore = [];
    tableBody.querySelectorAll('input').forEach(input => {
        const value = input.value;
        const key = input.dataset.key;
        let displayText = value;

        // Skip converting margin input if the whole margin column is now hidden by CSS
        if (hideMargin && key === 'margin') {
            return;
        }

        if (key === 'margin') {
            displayText += '%';
        } else if (key === 'price' || key === 'rrp') {
             const itemId = input.id.split('-')[1];
             const item = currentQuoteItems.find(i => i.id == itemId);

             if (item && item[key] !== undefined) {
                 displayText = `${CURRENCY_SYMBOL} ${item[key].toFixed(2)}`;
             } else {
                 displayText = `${CURRENCY_SYMBOL} ${parseFloat(value).toFixed(2)}`;
             }
        }
        
        const textNode = document.createElement('span');
        textNode.textContent = displayText;
        textNode.classList.add('exported-text'); 
        
        inputsToRestore.push({ parent: input.parentNode, input: input, value: value });

        input.parentNode.replaceChild(textNode, input);
    });
    
    // --- STEP 3: Generate Canvas ---
    const quoteElement = document.getElementById('quote-output-area');

    try {
        const canvas = await html2canvas(quoteElement, {
            scale: 2, 
            logging: false,
            allowTaint: true, 
            useCORS: true, 
        });

        const customerName = document.getElementById('output-customer-name').textContent;
        const fileName = `Quote_${COMPANY_NAME}_${customerName}`;
        
        // --- STEP 4: Export Logic (PNG/PDF) ---
        if (type === 'png') {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = image;
            link.click();
            showExportConfirmation(type); 
        } else if (type === 'pdf') {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            
            const imgWidth = 210; 
            const pageHeight = 297; 
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                pdf.addPage();
                position = position - pageHeight;
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${fileName}.pdf`);
            showExportConfirmation(type); 
        }
    } catch (error) {
        console.error("Export failed:", error);
        alert(`❌ Export Failed! Please ensure your logo is Base64 encoded in index.html, or check your browser console for the error.`);
    } finally {
        // --- STEP 5: Restore UI ---
        
        // Remove the special CSS class if it was applied
        if (hideMargin) {
            quoteTable.classList.remove('col-hidden-margin-action');
        }

        // Restore inputs
        inputsToRestore.forEach(item => {
            const textNode = item.parent.querySelector('.exported-text');
            if (textNode) {
                item.parent.replaceChild(item.input, textNode);
                item.input.value = item.value; 
            }
        });

        // Restore controls
        controlsPanel.style.display = 'flex';
        exportButtons.style.display = 'block';
        if (addCategoryArea) addCategoryArea.style.display = 'block';
        exportedCustomPlaceholder.classList.add('hidden');
        addLineButtons.forEach(row => row.style.display = 'table-row'); 

        // Restore Action column
        document.querySelectorAll('#quote-table th.action-col').forEach(th => th.style.display = 'table-cell');
        document.querySelectorAll('.action-col').forEach(col => col.style.display = 'table-cell');
    }
}

// --- 1. CONFIGURATION ---

const CORRECT_PASSWORD = "admin123";
const COMPANY_NAME = "TRUE ORIGIN FOODS";
const COMPANY_LOGO_FILENAME = "logo.png"; 
const CURRENCY_SYMBOL = '₹';

// Default product list with categories
const defaultProducts = [
    { item: "CREAM BUN", price: 17.00, category: "Breads & Buns" },
    { item: "JAM BUN", price: 16.00, category: "Breads & Buns" },
    { item: "COCONUT BUN small", price: 17.00, category: "Breads & Buns" },
    { item: "BURGER BUN", price: 14.00, category: "Breads & Buns" },
    { item: "JAM ROLL", price: 17.00, category: "Breads & Buns" },
    { item: "CHOCO DONUT", price: 18.00, category: "Breads & Buns" },
    // Moved Tea Buns to Breads & Buns
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
    // Removed the singular Add New Item button listener
    document.getElementById('export-pdf-button').addEventListener('click', () => exportQuote('pdf'));
    document.getElementById('export-image-button').addEventListener('click', () => exportQuote('png'));

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
        calculateItemRow(item.id, 'margin');
    });
}

// Renders the entire table from the currentQuoteItems array, grouped by category
function renderQuoteTable() {
    const tableBody = document.getElementById('quote-table-body');
    tableBody.innerHTML = ''; 

    const defaultMargin = parseFloat(document.getElementById('default-margin').value) || 30;

    // Sort items by category
    const sortedItems = [...currentQuoteItems].sort((a, b) => {
        if (a.category && b.category) {
            return a.category.localeCompare(b.category);
        }
        if (a.category) return -1; 
        if (b.category) return 1;
        return 0; 
    });

    let currentCategory = null;
    let itemsInCurrentCategory = [];

    sortedItems.forEach((item, index) => {
        if (!item.id) item.id = Date.now() + index;
        if (item.margin === undefined) item.margin = defaultMargin;

        // Check if we need to render the previous category's "Add Line" button
        if (item.category && item.category !== currentCategory) {
            if (currentCategory !== null) {
                renderAddLineButton(currentCategory);
            }
            // Add new category header
            const categoryRow = tableBody.insertRow();
            const categoryCell = categoryRow.insertCell();
            categoryCell.colSpan = 5; 
            categoryCell.className = 'category-header';
            categoryCell.textContent = item.category;
            currentCategory = item.category;
            itemsInCurrentCategory = []; // Reset for new category
        }
        
        // Render item row
        renderItemRow(item);
        itemsInCurrentCategory.push(item);
    });

    // Render the Add Line button for the very last category
    if (currentCategory !== null) {
        renderAddLineButton(currentCategory);
    }
}

// Renders the "Add New Product Line" button row
function renderAddLineButton(category) {
    const tableBody = document.getElementById('quote-table-body');
    const addLineRow = tableBody.insertRow();
    addLineRow.className = 'add-line-btn-row'; // Class to hide on export
    
    const buttonCell = addLineRow.insertCell();
    buttonCell.colSpan = 5;
    
    // Use the category name to identify where to add the new product
    buttonCell.innerHTML = `<button class="neumorphic-btn secondary-btn" onclick="addNewItem('${category}')">Add New Product Line to ${category}</button>`;
}

// Renders a single item row with inputs
function renderItemRow(item) {
    const tableBody = document.getElementById('quote-table-body');
    const newRow = tableBody.insertRow();
    newRow.id = `row-${item.id}`;
    newRow.setAttribute('data-category', item.category || 'Custom');

    // 1. Item Name (Left Align)
    const itemCell = newRow.insertCell();
    itemCell.className = 'item-col align-left';
    itemCell.innerHTML = `<input type="text" id="item-${item.id}" value="${item.item}" class="neumorphic-input align-left" oninput="updateItemData(${item.id}, 'item', this.value)">`;

    // 2. Wholesale Price (WP) (Right Align)
    const wpCell = newRow.insertCell();
    wpCell.className = 'price-col align-right';
    wpCell.innerHTML = `<input type="number" id="price-${item.id}" value="${item.price.toFixed(2)}" min="0.01" step="0.50" class="neumorphic-input price-input align-right" data-key="price" oninput="calculateItemRow(${item.id}, 'price')">`;

    // 3. Retailer Margin (%) (Center Align)
    const marginCell = newRow.insertCell();
    marginCell.className = 'margin-col align-center';
    marginCell.innerHTML = `<input type="number" id="margin-${item.id}" value="${item.margin.toFixed(2)}" min="0" max="100" step="0.01" class="neumorphic-input margin-input align-center" data-key="margin" oninput="calculateItemRow(${item.id}, 'margin')">`;

    // 4. Recommended Retail Price (RRP) (Right Align)
    const rrpCell = newRow.insertCell();
    rrpCell.className = 'price-col align-right';
    rrpCell.innerHTML = `<input type="number" id="rrp-${item.id}" value="" min="0.01" step="0.50" class="neumorphic-input price-input align-right" data-key="rrp" oninput="calculateItemRow(${item.id}, 'rrp')">`;
    
    // 5. Remove Button (Center Align)
    const actionCell = newRow.insertCell();
    actionCell.className = 'action-col align-center';
    actionCell.innerHTML = `<button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>`;

    calculateItemRow(item.id, 'margin'); 
}

function updateItemData(itemId, key, value) {
    const item = currentQuoteItems.find(i => i.id == itemId);
    if (!item) return;
    item[key] = value; 
}

// --- 5. DYNAMIC 2-OF-3 CALCULATION LOGIC ---

function calculateItemRow(itemId, lastChangedKey) {
    const item = currentQuoteItems.find(i => i.id == itemId);
    if (!item) return;

    const wpInput = document.getElementById(`price-${itemId}`);
    const rrpInput = document.getElementById(`rrp-${itemId}`);
    const marginInput = document.getElementById(`margin-${itemId}`);

    let wp = parseFloat(wpInput.value);
    let rrp = parseFloat(rrpInput.value);
    let margin = parseFloat(marginInput.value);

    wp = isNaN(wp) || wp < 0 ? 0 : wp;
    rrp = isNaN(rrp) || rrp < 0 ? 0 : rrp;
    margin = isNaN(margin) || margin < 0 ? 0 : margin;

    const epsilon = 0.0001;

    let calculatedValue;
    let targetInput;
    let targetKey;

    try {
        // Case 1: WP and Margin known -> Calculate RRP
        if ((lastChangedKey === 'price' || lastChangedKey === 'margin') && wp > epsilon && margin < 100) {
            calculatedValue = wp / (1 - margin / 100);
            targetInput = rrpInput;
            targetKey = 'rrp';
        } 
        // Case 2: RRP and Margin known -> Calculate WP
        else if ((lastChangedKey === 'rrp' || lastChangedKey === 'margin') && rrp > epsilon && margin < 100) {
            calculatedValue = rrp * (1 - margin / 100);
            targetInput = wpInput;
            targetKey = 'price';
        } 
        // Case 3: WP and RRP known -> Calculate Margin
        else if ((lastChangedKey === 'price' || lastChangedKey === 'rrp') && wp > epsilon && rrp > wp) {
            calculatedValue = (1 - (wp / rrp)) * 100;
            targetInput = marginInput;
            targetKey = 'margin';
        } else {
            return;
        }

        if (isFinite(calculatedValue)) {
            targetInput.value = calculatedValue.toFixed(2);
            item[targetKey] = parseFloat(targetInput.value);
        }

    } catch (e) {
        console.error("Calculation error:", e);
    }
}


// Modified to accept category for correct placement
function addNewItem(category = 'Custom') {
    const defaultMargin = parseFloat(document.getElementById('default-margin').value) || 30;
    const newItem = { 
        item: "Custom Product", 
        price: 0.00, 
        margin: defaultMargin,
        category: category,
        id: Date.now() 
    };

    // Find the insertion index: after the last item of this category
    const lastItemIndex = currentQuoteItems.map(i => i.category).lastIndexOf(category);
    
    if (lastItemIndex !== -1) {
        currentQuoteItems.splice(lastItemIndex + 1, 0, newItem);
    } else {
        currentQuoteItems.push(newItem); // Should only happen if 'Custom' category is not found
    }

    renderQuoteTable(); // Re-render the whole table to place the new item and buttons correctly
}

// Removes an item from the table
function removeItem(itemId) {
    currentQuoteItems = currentQuoteItems.filter(item => item.id !== itemId);
    renderQuoteTable(); // Re-render to update grouping and buttons
}

// --- 6. EXPORT LOGIC ---

async function exportQuote(type) {
    // 1. Pre-export adjustments (Hiding controls and preparing table)
    const controlsPanel = document.getElementById('controls-panel');
    const exportButtons = document.getElementById('export-buttons');
    const exportedCustomPlaceholder = document.getElementById('exported-custom-item-placeholder');
    const actionColumn = document.querySelectorAll('.action-col');
    const tableBody = document.getElementById('quote-table-body');
    const addLineButtons = document.querySelectorAll('.add-line-btn-row'); // Select the new button rows
    
    // Hide controls and buttons
    controlsPanel.style.display = 'none';
    exportButtons.style.display = 'none';

    // Hide all Add New Line buttons
    addLineButtons.forEach(row => row.style.display = 'none');
    // Show the single "Please contact us" text at the very bottom
    exportedCustomPlaceholder.classList.remove('hidden');

    // Hide the 'Action' column headers and cells
    document.querySelectorAll('#quote-table th.action-col').forEach(th => th.style.display = 'none');
    actionColumn.forEach(col => col.style.display = 'none');

    // Convert inputs to text nodes for clean output
    const inputsToRestore = [];
    tableBody.querySelectorAll('input').forEach(input => {
        const value = input.value;
        const key = input.dataset.key;
        let displayText = value;

        if (key === 'margin') {
            displayText += '%';
        } else if (key === 'price' || key === 'rrp') {
            displayText = `${CURRENCY_SYMBOL} ${value}`;
        }
        
        const textNode = document.createElement('span');
        textNode.textContent = displayText;
        textNode.classList.add('exported-text'); 
        
        inputsToRestore.push({ parent: input.parentNode, input: input });

        input.parentNode.replaceChild(textNode, input);
    });

    // 2. Generate Canvas from HTML
    const quoteElement = document.getElementById('quote-output-area');
    const canvas = await html2canvas(quoteElement, {
        scale: 2, 
        logging: false,
        useCORS: true 
    });

    // 3. Export based on type
    const customerName = document.getElementById('output-customer-name').textContent;
    const fileName = `Quote_${COMPANY_NAME}_${customerName}`;
    
    if (type === 'png') {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = image;
        link.click();
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

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${fileName}.pdf`);
    }

    // 4. Restore hidden elements and inputs
    
    // Restore inputs first
    inputsToRestore.forEach(item => {
        const textNode = item.parent.querySelector('.exported-text');
        if (textNode) {
            item.parent.replaceChild(item.input, textNode);
        }
    });

    // Restore controls and buttons
    controlsPanel.style.display = 'flex';
    exportButtons.style.display = 'block';
    exportedCustomPlaceholder.classList.add('hidden');
    addLineButtons.forEach(row => row.style.display = 'table-row'); // Restore Add New Line buttons

    // Restore action column headers and cells
    document.querySelectorAll('#quote-table th.action-col').forEach(th => th.style.display = 'table-cell');
    actionColumn.forEach(col => col.style.display = 'table-cell');
}
const forms = [
    { name: 'Deliveries', icon: '🚚', url: null, type: 'deliveries' },
    { name: 'Bar', icon: '🍺', url: 'https://forms.fillout.com/t/aYrnkdjWzius' },
    { name: 'Take out', icon: '🥡', url: 'https://forms.fillout.com/t/geAFJvD7raus' },
    { name: 'Drinks', icon: '🥤', url: 'https://forms.fillout.com/t/1L4bMUqvqWus' },
    { name: 'Cleaning', icon: '🧹', url: 'https://forms.fillout.com/t/nSJgrnjZxhus' },
    { name: 'Veggies', icon: '🥬', url: 'https://forms.fillout.com/t/wrJnoNGTzLus' },
    { name: 'Meat', icon: '🥩', url: 'https://forms.fillout.com/t/2KPaCFs1JVus' },
    { name: 'Dry', icon: '📦', url: 'https://forms.fillout.com/t/rHcnCbpdpkus' },
    { name: 'Wet', icon: '🥫', url: 'https://forms.fillout.com/t/iE4K5FkACNus' },
    { name: 'Spices', icon: '🌶️', url: 'https://forms.fillout.com/t/eRBFZW8EK6us' },
    { name: 'Frozen', icon: '🧊', url: 'https://forms.fillout.com/t/7YUpeDkQ4Kus' },
    { name: 'Sweet', icon: '🍰', url: 'https://forms.fillout.com/t/9QBF3nCoJnus' }
];

// n8n Webhook Configuration - REPLACE WITH YOUR ACTUAL URLS
const N8N_WEBHOOKS = {
    getDeliveries: 'https://primary-production-191cf.up.railway.app/webhook/deliveries/this-week',
    getDetails: 'https://primary-production-191cf.up.railway.app/webhook/deliveries/details',
    markReceived: 'https://primary-production-191cf.up.railway.app/webhook/deliveries/mark-received'
};

// Staff names for dropdown
const STAFF_NAMES = [
    'Elzbieta',
    'Bohdan',
    'Lotte',
    'Steffen',
    'Helene',
    'Michelle',
    'Annabelle',
    'Julia',
    'Oliver',
    'Gustav',
    'Joel',
    'Yericka',
    'Victoria'
];

// Vendor icon mapping
const VENDOR_ICONS = {
    'TL Måkestad AS': '🥬',
    'ASKO VEST AS': '🥫',
    'Bama Storkjøkken': '🥬',
    'Måkestad Engros AS': '🥫',
    'Godt Lokalt': '🥩',
    'Storcash': '🚚',
    'Tingstad': '🥡',
    'BIOPACK': '🥡',
    'Solberg & Hansen': '☕️',
    'Lofoten Seaweed Company AS': '🐠'
};

// Function to get vendor icon
function getVendorIcon(vendorName) {
    return VENDOR_ICONS[vendorName] || '📦'; // Default to box if vendor not found
}

const formList = document.getElementById('formList');
const welcome = document.getElementById('welcome');
const formContainer = document.getElementById('formContainer');

// Create form buttons
forms.forEach((form, index) => {
    const li = document.createElement('li');
    li.className = 'form-item';
    
    const button = document.createElement('button');
    button.className = 'form-button';
    button.innerHTML = `<span class="form-icon">${form.icon}</span><span>${form.name}</span>`;
    button.onclick = () => {
        document.querySelectorAll('.form-button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        if (form.type === 'deliveries') {
            showDeliveriesList();
        } else {
            loadForm(form.url, index);
        }
    };
    
    li.appendChild(button);
    formList.appendChild(li);
});

function loadForm(url, index) {
    console.log('Loading form:', url);
    
    // Hide welcome message
    welcome.classList.add('hidden');
    
    // Clear and create new iframe wrapper
    formContainer.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'form-wrapper active';
    wrapper.style.cssText = 'left: 0; width: 100%; height: 100%; position: absolute; top: 0;';
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = 'top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'camera; microphone');
    
    iframe.onload = function() {
        console.log('Form loaded successfully');
    };
    
    iframe.onerror = function() {
        console.error('Error loading form');
    };
    
    wrapper.appendChild(iframe);
    formContainer.appendChild(wrapper);
}

// Deliveries Functions

async function showDeliveriesList() {
    welcome.classList.add('hidden');
    formContainer.innerHTML = '<div class="loading">📦 Loading deliveries...</div>';
    
    try {
        const response = await fetch(N8N_WEBHOOKS.getDeliveries);
        const data = await response.json();

        // Get raw list from n8n
        const rawDeliveries = data.deliveries || [];

        // Filter out "empty" placeholder deliveries (id null/undefined)
        const deliveries = rawDeliveries.filter(d => d && d.id);

        if (deliveries.length === 0) {
            formContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h2>No Pending Deliveries</h2>
                    <p>All deliveries for this week have been received!</p>
                </div>
            `;
            return;
        }
        
        const html = `
            <div class="deliveries-container">
                <div class="deliveries-header">
                    <h2>🚚 Deliveries This Week</h2>
                    <span class="delivery-count">${deliveries.length} pending</span>
                </div>
                <div class="deliveries-list">
                    ${deliveries.map(delivery => `
                        <div class="delivery-card" onclick="showDeliveryDetails('${delivery.id}')">
                            <div class="delivery-main">
                                <div class="delivery-vendor">
                                    <span class="vendor-icon">${getVendorIcon(delivery.vendor)}</span>
                                    <h3>${delivery.vendor}</h3>
                                </div>
                                <div class="delivery-po">
                                    📅 ${delivery.orderDate ? formatDate(delivery.orderDate) : 'No Date'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        formContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        formContainer.innerHTML = `
            <div class="error-state">
                <h3>❌ Error Loading Deliveries</h3>
                <p>Could not load deliveries. Please check your connection and try again.</p>
                <button onclick="showDeliveriesList()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

async function showDeliveryDetails(deliveryId) {
    formContainer.innerHTML = '<div class="loading">📋 Loading details...</div>';
    
    try {
        const response = await fetch(`${N8N_WEBHOOKS.getDetails}?id=${deliveryId}`);
        const data = await response.json();

        // Build staff dropdown options
        const staffOptions = STAFF_NAMES
            .map(name => `<option value="${name}">${name}</option>`)
            .join('');
        
        const html = `
            <div class="delivery-details">
                <button class="back-btn" onclick="showDeliveriesList()">← Back to Deliveries</button>
                
                <div class="delivery-header">
                    <div class="vendor-title">
                        <span class="vendor-icon-large">${getVendorIcon(data.delivery.vendor)}</span>
                        <h2>${data.delivery.vendor}</h2>
                    </div>
                    ${data.delivery.po ? `<span class="po-badge">PO #${data.delivery.po}</span>` : ''}
                </div>
                
                <h3>Items (${data.items.length})</h3>
                <div class="items-list">
                    ${data.items.map(item => `
                        <div class="item-row">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">Qty: ${item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="receive-section">
                    <h3>✓ Mark as Received</h3>
                    <div class="form-group">
                        <label>Your Name <span class="required">*</span></label>
                        <select 
                            id="receivedBy" 
                            class="form-input"
                            required
                        >
                            <option value="">Select your name</option>
                            ${staffOptions}
                        </select>
                    </div>
                    <button onclick="markDeliveryReceived('${deliveryId}', this)" class="receive-btn">
                        ✓ Confirm & Archive Delivery
                    </button>
                </div>
            </div>
        `;
        
        formContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading delivery details:', error);
        formContainer.innerHTML = `
            <div class="error-state">
                <h3>❌ Error Loading Details</h3>
                <p>Could not load delivery details. Please try again.</p>
                <button onclick="showDeliveriesList()" class="back-btn">Back to Deliveries</button>
            </div>
        `;
    }
}

async function markDeliveryReceived(deliveryId, btnElement) {
    const receivedBy = document.getElementById('receivedBy').value.trim();
    
    if (!receivedBy) {
        alert('⚠️ Please select your name');
        return;
    }
    
    // Disable button to prevent double submission
    const btn = btnElement;
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    try {
        const response = await fetch(N8N_WEBHOOKS.markReceived, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deliveryId: deliveryId,
                receivedBy: receivedBy
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Delivery marked as received by ${receivedBy} and archived!`);
            showDeliveriesList();
        } else {
            alert('❌ Error updating delivery. Please try again.');
            btn.disabled = false;
            btn.textContent = '✓ Confirm & Archive Delivery';
        }
        
    } catch (error) {
        console.error('Error marking delivery:', error);
        alert('❌ Error updating delivery. Please try again.');
        btn.disabled = false;
        btn.textContent = '✓ Confirm & Archive Delivery';
    }
}

// Helper function
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

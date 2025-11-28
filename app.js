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

// n8n Webhook Configuration
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

// Common issues for quick selection
const COMMON_ISSUES = [
    'Missing items',
    'Damaged packaging',
    'Arrived late',
    'Wrong quantities',
    'Quality issues',
    'Incomplete order'
];

// Function to get vendor icon
function getVendorIcon(vendorName) {
    return VENDOR_ICONS[vendorName] || '📦';
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

        // Filter out "empty" placeholder deliveries
        const deliveries = rawDeliveries.filter(d => d && d.id);

        if (deliveries.length === 0) {
            formContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h2>No Pending Deliveries</h2>
                    <p>All deliveries for this week have been received!</p>
                    <button onclick="showDeliveriesList()" class="retry-btn" style="margin-top: 20px;">
                        🔄 Refresh
                    </button>
                </div>
            `;
            return;
        }

        // Sort deliveries by date (most recent first)
        deliveries.sort((a, b) => {
            const dateA = new Date(a.orderDate || 0);
            const dateB = new Date(b.orderDate || 0);
            return dateB - dateA;
        });

        const html = `
            <div class="deliveries-container">
                <div class="deliveries-header">
                    <h2>🚚 Deliveries This Week</h2>
                    <div class="header-actions">
                        <span class="delivery-count">${deliveries.length} pending</span>
                        <button onclick="showDeliveriesList()" class="refresh-btn" title="Refresh">🔄</button>
                    </div>
                </div>
                <div class="deliveries-list">
                    ${deliveries.map(delivery => {
                        const itemCount = delivery.itemCount || 0;
                        return `
                            <div class="delivery-card" onclick="showDeliveryDetails('${delivery.id}')">
                                <div class="delivery-main">
                                    <div class="delivery-vendor">
                                        <span class="vendor-icon">${getVendorIcon(delivery.vendor)}</span>
                                        <div>
                                            <h3>${delivery.vendor}</h3>
                                            ${itemCount > 0 ? `<span class="item-count-badge">${itemCount} items</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="delivery-meta">
                                        <div class="delivery-date">
                                            📅 ${delivery.orderDate ? formatDate(delivery.orderDate) : 'No Date'}
                                        </div>
                                    </div>
                                </div>
                                <div class="arrow">→</div>
                            </div>
                        `;
                    }).join('')}
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

        // Build quick issue buttons
        const quickIssueButtons = COMMON_ISSUES
            .map(issue => `
                <button type="button" class="quick-issue-btn" onclick="addQuickIssue('${issue}')">
                    ${issue}
                </button>
            `)
            .join('');

        const html = `
            <div class="delivery-details" id="deliveryDetailsContainer">
                <button class="back-btn" onclick="showDeliveriesList()">← Back to Deliveries</button>
                
                <div class="delivery-header">
                    <div class="vendor-title">
                        <span class="vendor-icon-large">${getVendorIcon(data.delivery.vendor)}</span>
                        <h2>${data.delivery.vendor}</h2>
                    </div>
                    ${data.delivery.orderDate ? `<span class="po-badge">📅 ${formatDate(data.delivery.orderDate)}</span>` : ''}
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
                    
                    <div class="form-group">
                        <label>Delivery Notes (Optional)</label>
                        <div class="quick-issues">
                            ${quickIssueButtons}
                        </div>
                        <textarea 
                            id="deliveryNotes" 
                            class="form-input form-textarea"
                            placeholder="Add any issues, discrepancies, or observations..."
                            rows="3"
                        ></textarea>
                        <small class="field-hint">💡 Click quick buttons above or type custom notes</small>
                    </div>
                    
                    <button onclick="markDeliveryReceived('${deliveryId}', this)" class="receive-btn">
                        <span class="btn-icon">✓</span>
                        <span class="btn-text">Confirm & Archive Delivery</span>
                    </button>
                </div>
            </div>
            <button class="scroll-down-btn" onclick="scrollToBottom()" title="Scroll to form">
                ↓
            </button>
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

// Add quick issue to notes
function addQuickIssue(issue) {
    const textarea = document.getElementById('deliveryNotes');
    const currentValue = textarea.value.trim();
    
    // Check if issue already exists
    if (currentValue.includes(issue)) {
        return;
    }
    
    // Add issue with proper formatting
    if (currentValue === '') {
        textarea.value = '• ' + issue;
    } else {
        textarea.value = currentValue + '\n• ' + issue;
    }
    
    // Focus textarea
    textarea.focus();
}

async function markDeliveryReceived(deliveryId, btnElement) {
    const receivedBy = document.getElementById('receivedBy').value.trim();
    const deliveryNotes = document.getElementById('deliveryNotes').value.trim();

    if (!receivedBy) {
        alert('⚠️ Please select your name');
        return;
    }

    // Disable button and show loading state
    const btn = btnElement;
    const btnIcon = btn.querySelector('.btn-icon');
    const btnText = btn.querySelector('.btn-text');
    
    btn.disabled = true;
    btn.classList.add('loading');
    if (btnIcon) btnIcon.textContent = '⏳';
    if (btnText) btnText.textContent = 'Processing...';

    try {
        const response = await fetch(N8N_WEBHOOKS.markReceived, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deliveryId: deliveryId,
                receivedBy: receivedBy,
                notes: deliveryNotes || null,
                receivedAt: new Date().toISOString()
            })
        });

        const result = await response.json();

        if (result.success) {
            // Show success state
            btn.classList.remove('loading');
            btn.classList.add('success');
            if (btnIcon) btnIcon.textContent = '✅';
            if (btnText) btnText.textContent = 'Archived Successfully!';
            
            // Wait a moment before redirecting
            setTimeout(() => {
                showDeliveriesList();
            }, 1000);
        } else {
            throw new Error('Update failed');
        }

    } catch (error) {
        console.error('Error marking delivery:', error);
        alert('❌ Error updating delivery. Please try again.');
        
        // Reset button state
        btn.disabled = false;
        btn.classList.remove('loading');
        if (btnIcon) btnIcon.textContent = '✓';
        if (btnText) btnText.textContent = 'Confirm & Archive Delivery';
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

// Add keyboard shortcut for refresh (Ctrl/Cmd + R while on deliveries view)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        const deliveriesBtn = document.querySelector('.form-button.active');
        if (deliveriesBtn && deliveriesBtn.textContent.includes('Deliveries')) {
            e.preventDefault();
            showDeliveriesList();
        }
    }
});

// Scroll to bottom function
function scrollToBottom() {
    const deliveryDetails = document.getElementById('deliveryDetailsContainer');
    if (deliveryDetails) {
        deliveryDetails.scrollTo({
            top: deliveryDetails.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Show/hide scroll button based on scroll position
function updateScrollButton() {
    const deliveryDetails = document.getElementById('deliveryDetailsContainer');
    const scrollBtn = document.querySelector('.scroll-down-btn');
    
    if (deliveryDetails && scrollBtn) {
        const isNearBottom = deliveryDetails.scrollHeight - deliveryDetails.scrollTop - deliveryDetails.clientHeight < 100;
        scrollBtn.style.opacity = isNearBottom ? '0' : '1';
        scrollBtn.style.pointerEvents = isNearBottom ? 'none' : 'auto';
    }
}

// Listen for scroll on delivery details
document.addEventListener('scroll', function(e) {
    if (e.target.id === 'deliveryDetailsContainer') {
        updateScrollButton();
    }
}, true);

// Check scroll position initially
setTimeout(updateScrollButton, 100);

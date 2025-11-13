const forms = [
    { name: 'Take out', icon: '🥡', url: 'https://forms.fillout.com/t/geAFJvD7raus' },
    { name: 'Bar', icon: '🍺', url: 'https://forms.fillout.com/t/aYrnkdjWzius' },
    { name: 'Frozen', icon: '🧊', url: 'https://forms.fillout.com/t/7YUpeDkQ4Kus' },
    { name: 'Drinks', icon: '🥤', url: 'https://forms.fillout.com/t/1L4bMUqvqWus' },
    { name: 'Cleaning', icon: '🧹', url: 'https://forms.fillout.com/t/nSJgrnjZxhus' },
    { name: 'Sweet', icon: '🍰', url: 'https://forms.fillout.com/t/9QBF3nCoJnus' },
    { name: 'Meat', icon: '🥩', url: 'https://forms.fillout.com/t/2KPaCFs1JVus' },
    { name: 'Spices', icon: '🌶️', url: 'https://forms.fillout.com/t/eRBFZW8EK6us' },
    { name: 'Dry', icon: '📦', url: 'https://forms.fillout.com/t/rHcnCbpdpkus' },
    { name: 'Wet', icon: '🥫', url: 'https://forms.fillout.com/t/iE4K5FkACNus' },
    { name: 'Veggies', icon: '🥬', url: 'https://forms.fillout.com/t/wrJnoNGTzLus' }
];

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
    button.onclick = () => loadForm(form.url, index);
    
    li.appendChild(button);
    formList.appendChild(li);
});

function loadForm(url, index) {
    console.log('Loading form:', url);
    
    // Update active button
    document.querySelectorAll('.form-button').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

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
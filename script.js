// script.js

async function fetchFormData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedPath = urlParams.get('expose');

        if (!encodedPath) {
            throw new Error('No "expose" parameter found in the URL');
        }

        const recordId = atob(encodedPath);
        const response = await fetch(`https://immocrm.pythonanywhere.com/api/record/${recordId}/`, {
            method: 'GET'
        });
        
        const data = await response.json();
        return JSON.parse(data.data);
    } catch (error) {
        console.error(error);
        redirectToErrorPage();
    }
}

function redirectToErrorPage() {
    window.location.href = 'error.html';
}

function populatePropertyDetails(data) {
    const detailsContainer = document.getElementById('property-details');
    const details = data.property_details;
    
    for (const [key, value] of Object.entries(details)) {
        const detailElement = document.createElement('p');
        detailElement.className = 'mb-2';
        detailElement.innerHTML = `<strong class="capitalize">${key.replace('_', ' ')}:</strong> ${value}`;
        detailsContainer.appendChild(detailElement);
    }
}

function getRedirectURL() {
    return location.origin + window.location.pathname + 'success.html';
}

function populateForm(data) {
    const form = document.getElementById('web-to-lead-form');
    data.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-4';

        const label = document.createElement('label');
        label.htmlFor = field.name;
        label.className = 'block text-gray-700 text-sm font-bold mb-2';
        label.textContent = field.label;
        formGroup.appendChild(label);

        if (field.name === 'message') {
            const textarea = document.createElement('textarea');
            textarea.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
            textarea.id = field.name;
            textarea.name = field.name;
            textarea.required = field.required;
            textarea.rows = 4;
            formGroup.appendChild(textarea);
        } else {
            const input = document.createElement('input');
            input.type = field.name === 'email' ? 'email' : 'text';
            input.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
            input.id = field.name;
            input.name = field.name;
            input.required = field.required;
            formGroup.appendChild(input);
        }

        form.appendChild(formGroup);
    });

    // Add terms checkbox
    const termsGroup = document.createElement('div');
    termsGroup.className = 'mb-4';
    const termsLabel = document.createElement('label');
    termsLabel.className = 'flex items-center';
    const termsCheckbox = document.createElement('input');
    termsCheckbox.type = 'checkbox';
    termsCheckbox.id = 'terms';
    termsCheckbox.className = 'mr-2';
    termsCheckbox.required = true;
    termsLabel.appendChild(termsCheckbox);
    const termsText = document.createElement('span');
    termsText.innerHTML = 'I agree to the <a href="tc.html" target="_blank" class="text-primary hover:underline">Terms and Conditions</a>';
    termsLabel.appendChild(termsText);
    termsGroup.appendChild(termsLabel);
    form.appendChild(termsGroup);

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.id = 'submit-button';
    submitButton.className = 'bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 hover:bg-blue-700';
    submitButton.textContent = 'Submit';
    form.appendChild(submitButton);

    form.addEventListener('submit', submitForm);
}

function populateHeader(data) {
    const headerImage = document.getElementById('header-image');
    headerImage.src = data.headerImage.url;
    headerImage.alt = data.headerImage.alt;

    const companyName = document.getElementById('company-name');
    companyName.textContent = data.companyName;
}

function populateGallery(data) {
    const gallery = document.querySelector('.gallery');
    data.gallery.forEach(image => {
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.alt;
        img.className = 'w-full h-48 object-cover rounded-lg shadow-md';
        gallery.appendChild(img);
    });
}

async function submitForm(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const encodedPath = urlParams.get('expose');
    if (!encodedPath) {
        throw new Error('No "expose" parameter found in the URL');
    }

    try {
        const recordId = atob(encodedPath);
    } catch (error) {
        redirectToErrorPage();
    }

    const recordId = atob(encodedPath);
    const form = document.getElementById('web-to-lead-form');
    const submitButton = document.getElementById('submit-button');
    const errorMessage = document.getElementById('error-message');

    // Check form validity
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = {};
    let isValid = true;

    form.querySelectorAll('input, textarea').forEach(field => {
        if (field.type !== 'checkbox') {
            if (field.required && !field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
            } else {
                field.classList.remove('border-red-500');
                formData[field.name] = field.value;
            }
        }
    });

    if (!isValid) {
        errorMessage.textContent = 'Please fill in all required fields.';
        return;
    }

    formData['id'] = recordId;

    // Disable the submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    errorMessage.textContent = '';

    try {
        const response = await fetch('https://immocrm.pythonanywhere.com/api/submit-web-to-lead/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            window.location.href = 'success.html';
        } else {
            redirectToErrorPage();
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred while submitting the form. Please try again.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
}

async function initPage() {
    const data = await fetchFormData();
    if (data) {
        populatePropertyDetails(data);
        populateForm(data);
        populateHeader(data);
        populateGallery(data);
    }
}

document.addEventListener('DOMContentLoaded', initPage);
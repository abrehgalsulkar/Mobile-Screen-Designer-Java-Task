// Home page functionality
document.addEventListener('DOMContentLoaded', function () {
    const createAppBtn = document.getElementById('createAppBtn');
    const createAppModal = document.getElementById('createAppModal');
    const createAppForm = document.getElementById('createAppForm');
    const closeBtn = document.querySelector('.close');

    // Open create application modal
    createAppBtn.addEventListener('click', function () {
        createAppModal.style.display = 'block';
    });

    // Close modal when clicking on X
    closeBtn.addEventListener('click', function () {
        createAppModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === createAppModal) {
            createAppModal.style.display = 'none';
        }
    });

    // Handle form submission
    createAppForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(createAppForm);
        const appData = {
            name: formData.get('name'),
            iconPath: formData.get('iconPath') || null
        };

        createApplication(appData);
    });

    // Event delegation for app actions
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('open-app')) {
            const appId = e.target.dataset.appId;
            openApplication(appId);
        } else if (e.target.classList.contains('delete-app')) {
            const appId = e.target.dataset.appId;
            deleteApplication(appId);
        }
    });
});

// Create new application
async function createApplication(appData) {
    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appData)
        });

        if (response.ok) {
            const application = await response.json();
            showNotification('Application created successfully!', 'success');
            closeModal();
            // Reload page to show new application
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            const error = await response.text();
            showNotification('Error creating application: ' + error, 'error');
        }
    } catch (error) {
        showNotification('Error creating application: ' + error.message, 'error');
    }
}

// Open application
function openApplication(appId) {
    window.location.href = `/designer/${appId}`;
}

// Delete application
async function deleteApplication(appId) {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/applications/${appId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Application deleted successfully!', 'success');
            // Remove the app card from DOM
            const appCard = document.querySelector(`[data-app-id="${appId}"]`);
            if (appCard) {
                appCard.remove();
            }
        } else {
            const error = await response.text();
            showNotification('Error deleting application: ' + error, 'error');
        }
    } catch (error) {
        showNotification('Error deleting application: ' + error.message, 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('createAppModal').style.display = 'none';
    document.getElementById('createAppForm').reset();
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    }

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

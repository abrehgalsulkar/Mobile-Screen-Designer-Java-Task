// Home page functionality
document.addEventListener('DOMContentLoaded', function () {
    const createAppBtn = document.getElementById('createAppBtn');
    const createAppModal = document.getElementById('createAppModal');
    const createAppForm = document.getElementById('createAppForm');
    const editAppModal = document.getElementById('editAppModal');
    const editAppForm = document.getElementById('editAppForm');
    const closeBtns = document.querySelectorAll('.close');

    createAppBtn.addEventListener('click', function () {
        createAppModal.style.display = 'block';
    });

    // Close modals when clicking on X
    closeBtns.forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            createAppModal.style.display = 'none';
            editAppModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside   
    window.addEventListener('click', function (event) {
        if (event.target === createAppModal) {
            createAppModal.style.display = 'none';
        }
        if (event.target === editAppModal) {
            editAppModal.style.display = 'none';
        }
    });

    // Handle create form submission
    createAppForm.addEventListener('submit', function (e) {
        e.preventDefault();
        createApplication();
    });

    // Handle edit form submission
    editAppForm.addEventListener('submit', function (e) {
        e.preventDefault();
        updateApplication();
    });

    // Event delegation for app actions
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('open-app')) {
            const appId = e.target.dataset.appId;
            openApplication(appId);
        } else if (e.target.classList.contains('edit-app')) {
            const appId = e.target.dataset.appId;
            openEditModal(appId);
        } else if (e.target.classList.contains('delete-app')) {
            const appId = e.target.dataset.appId;
            deleteApplication(appId);
        }
    });
});

// Create new application
async function createApplication() {
    try {
        const formData = new FormData(document.getElementById('createAppForm'));
        const iconFile = formData.get('icon');

        let iconPath = null;

        // If icon file is selected, upload it first
        if (iconFile && iconFile.size > 0) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', iconFile);

            const uploadResponse = await fetch('/api/upload/icon', {
                method: 'POST',
                body: uploadFormData
            });

            if (uploadResponse.ok) {
                iconPath = await uploadResponse.text();
            } else {
                showNotification('Error uploading icon: ' + await uploadResponse.text(), 'error');
                return;
            }
        }

        // Create application with icon path
        const appData = {
            name: formData.get('name'),
            iconPath: iconPath
        };

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

// Open edit application modal
async function openEditModal(appId) {
    try {
        const response = await fetch(`/api/applications/${appId}`);
        if (response.ok) {
            const app = await response.json();

            document.getElementById('editAppId').value = app.id;
            document.getElementById('editAppName').value = app.name;

            // Show current icon preview
            const currentIconPreview = document.getElementById('currentIconPreview');
            if (app.iconPath) {
                currentIconPreview.innerHTML = `
                    <p>Current Icon:</p>
                    <img src="${app.iconPath}" alt="Current Icon" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                `;
            } else {
                currentIconPreview.innerHTML = '<p>No icon currently set</p>';
            }

            editAppModal.style.display = 'block';
        } else {
            showNotification('Error loading application details', 'error');
        }
    } catch (error) {
        showNotification('Error loading application details: ' + error.message, 'error');
    }
}

// Update application
async function updateApplication() {
    try {
        const formData = new FormData(document.getElementById('editAppForm'));
        const appId = formData.get('id');
        const iconFile = formData.get('icon');

        let iconPath = null;

        // If new icon file is selected, upload it first
        if (iconFile && iconFile.size > 0) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', iconFile);

            const uploadResponse = await fetch('/api/upload/icon', {
                method: 'POST',
                body: uploadFormData
            });

            if (uploadResponse.ok) {
                iconPath = await uploadResponse.text();
            } else {
                showNotification('Error uploading icon: ' + await uploadResponse.text(), 'error');
                return;
            }
        }

        // Update application
        const appData = {
            name: formData.get('name')
        };

        if (iconPath) {
            appData.iconPath = iconPath;
        }

        const response = await fetch(`/api/applications/${appId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appData)
        });

        if (response.ok) {
            showNotification('Application updated successfully!', 'success');
            closeEditModal();
            // Reload page to show updated application
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            const error = await response.text();
            showNotification('Error updating application: ' + error, 'error');
        }
    } catch (error) {
        showNotification('Error updating application: ' + error.message, 'error');
    }
}

// Close modals
function closeModal() {
    document.getElementById('createAppModal').style.display = 'none';
    document.getElementById('createAppForm').reset();
}

function closeEditModal() {
    document.getElementById('editAppModal').style.display = 'none';
    document.getElementById('editAppForm').reset();
    document.getElementById('currentIconPreview').innerHTML = '';
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

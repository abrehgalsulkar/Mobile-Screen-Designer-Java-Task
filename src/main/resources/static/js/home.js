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
            if (createAppModal.style.display === 'block') {
                closeModal();
            }
            if (editAppModal.style.display === 'block') {
                closeEditModal();
            }
        });
    });

    // Close modals when clicking outside and reset forms
    window.addEventListener('click', function (event) {
        if (event.target === createAppModal) {
            closeModal();
        }
        if (event.target === editAppModal) {
            closeEditModal();
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
    setupIconPreviews();
    setupParsleyValidation();
});

// ParsleyJS validation
function setupParsleyValidation() {
    const createForm = document.getElementById('createAppForm');
    const editForm = document.getElementById('editAppForm');

    if (createForm) {
        createForm.setAttribute('data-parsley-validate', '');
    }

    if (editForm) {
        editForm.setAttribute('data-parsley-validate', '');
    }
}

// Check if application name already exists
async function applicationNameExists(appName) {
    try {
        const response = await fetch('/api/applications');
        if (response.ok) {
            const applications = await response.json();
            return applications.some(app => app.name.toLowerCase() === appName.toLowerCase());
        }
    } catch (error) {
        console.error('Error checking application names:', error);
    }
    return false;
}

async function applicationNameExistsForUpdate(appName, currentAppId) {
    try {
        const response = await fetch('/api/applications');
        if (response.ok) {
            const applications = await response.json();
            return applications.some(app =>
                app.name.toLowerCase() === appName.toLowerCase() &&
                app.id.toString() !== currentAppId.toString()
            );
        }
    } catch (error) {
        console.error('Error checking application names:', error);
    }
    return false;
}

// Create new application
async function createApplication() {
    try {
        const formData = new FormData(document.getElementById('createAppForm'));
        const appName = formData.get('name');
        const iconFile = formData.get('icon');

        // Check if application name already exists
        if (await applicationNameExists(appName)) {
            Swal.fire({
                icon: 'error',
                title: 'Application Name Exists',
                text: 'An application with this name already exists. Please choose a different name.',
                confirmButtonText: 'OK'
            });
            return;
        }

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

async function deleteApplication(appId) {
    const result = await Swal.fire({
        title: 'Delete Application',
        text: 'Are you sure you want to delete this application? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/applications/${appId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Application deleted successfully!', 'success');
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
        const appName = formData.get('name');
        const iconFile = formData.get('icon');

        if (await applicationNameExistsForUpdate(appName, appId)) {
            Swal.fire({
                icon: 'error',
                title: 'Application Name Exists',
                text: 'An application with this name already exists. Please choose a different name.',
                confirmButtonText: 'OK'
            });
            return;
        }

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
    document.getElementById('iconPreview').style.display = 'none';
    document.getElementById('iconPreviewImg').src = '';
}

function closeEditModal() {
    document.getElementById('editAppModal').style.display = 'none';
    document.getElementById('editAppForm').reset();
    document.getElementById('currentIconPreview').innerHTML = '';
    document.getElementById('editIconPreview').style.display = 'none';
    document.getElementById('editIconPreviewImg').src = '';
}

function showNotification(message, type) {
    Swal.fire({
        icon: type,
        title: type === 'success' ? 'Success!' : 'Error!',
        text: message,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

function setupIconPreviews() {
    const createIconInput = document.getElementById('appIcon');
    if (createIconInput) {
        createIconInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
                if (!allowedTypes.includes(file.type)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid File Type',
                        text: 'Please select only PNG, JPG, JPEG, GIF, or SVG files.',
                        confirmButtonText: 'OK'
                    });
                    e.target.value = '';
                    document.getElementById('iconPreview').style.display = 'none';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    const preview = document.getElementById('iconPreview');
                    const previewImg = document.getElementById('iconPreviewImg');
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                document.getElementById('iconPreview').style.display = 'none';
            }
        });
    }

    const editIconInput = document.getElementById('editAppIcon');
    if (editIconInput) {
        editIconInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
                if (!allowedTypes.includes(file.type)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid File Type',
                        text: 'Please select only PNG, JPG, JPEG, GIF, or SVG files.',
                        confirmButtonText: 'OK'
                    });
                    e.target.value = '';
                    document.getElementById('editIconPreview').style.display = 'none';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    const preview = document.getElementById('editIconPreview');
                    const previewImg = document.getElementById('editIconPreviewImg');
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                document.getElementById('editIconPreview').style.display = 'none';
            }
        });
    }
}
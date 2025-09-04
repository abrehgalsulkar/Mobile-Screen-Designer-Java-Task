class ScreenDesigner {
    constructor() {
        this.components = [];
        this.selectedComponent = null;
        this.currentScreenId = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isResizing = false;
        this.resizeHandle = null;

        this.isScreenResizing = false;
        this.screenResizeStartY = 0;
        this.screenResizeStartHeight = 0;
        this.screenBackgroundColor = '#ffffff';
        this.screenBackgroundImage = null;
        // disable applying image to screen, only show preview
        this.applyBackgroundToScreen = false;

        this.isComponentDragging = false;
        this.isComponentResizing = false;
        this.componentResizeHandle = null;
        this.contextMenu = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingScreen();
        this.setupDragAndDrop();
        this.loadScreenList();

        this.setupScreenResizing();
        this.setupScreenBackground();
        this.setupContextMenu();
        this.hideBackgroundControls();

        this.ensureBackgroundLayer();
    }

    ensureBackgroundLayer() {
        const screenArea = document.getElementById('screenArea');
        if (!screenArea) return;
        screenArea.style.position = screenArea.style.position || 'relative';
        screenArea.style.overflow = screenArea.style.overflow || 'hidden';
        let layer = screenArea.querySelector('.screen-bg-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'screen-bg-layer';
            screenArea.insertBefore(layer, screenArea.firstChild);
        }
        this.bgLayer = layer;

        let img = screenArea.querySelector('.screen-bg-img');
        if (!img) {
            img = document.createElement('img');
            img.className = 'screen-bg-img';
            img.alt = '';
            img.style.position = 'absolute';
            img.style.top = '0';
            img.style.left = '0';
            img.style.right = '0';
            img.style.bottom = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.pointerEvents = 'none';
            img.style.zIndex = '0';
            screenArea.insertBefore(img, screenArea.firstChild);
        }
        this.bgImg = img;
    }

    setupEventListeners() {
        document.getElementById('saveScreenBtn').addEventListener('click', () => {
            this.saveScreen();
        });

        document.getElementById('newScreenBtn').addEventListener('click', () => {
            this.showNewScreenModal();
        });

        this.setupPropertyFormListeners();

        this.setupScreenActionListeners();

        document.getElementById('newScreenModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('newScreenModal')) {
                this.closeNewScreenModal();
            }
        });

        document.getElementById('newScreenForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewScreen();
        });

        document.getElementById('cancelScreenBtn').addEventListener('click', () => {
            this.closeNewScreenModal();
        });

        document.getElementById('screenName').addEventListener('input', (e) => {
            this.validateScreenName(e.target.value);
        });

        this.setupPageNavigationWarning();

        this.setupLogoutConfirmation();
    }

    setupPropertyFormListeners() {
        const inputs = ['componentX', 'componentY', 'componentWidth', 'componentHeight', 'componentTextColor'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.updateComponentProperty(e.target.id, e.target.value);
                });
            }
        });

        const checkbox = document.getElementById('componentChecked');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                this.updateComponentProperty('componentChecked', e.target.checked);
            });
        }

        document.getElementById('deleteComponentBtn').addEventListener('click', () => {
            this.deleteSelectedComponent();
        });

        document.getElementById('bringFrontBtn').addEventListener('click', () => {
            this.bringComponentToFront();
        });

        document.getElementById('sendBackBtn').addEventListener('click', () => {
            this.sendComponentToBack();
        });
    }

    setupScreenActionListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('load-screen')) {
                const screenId = e.target.dataset.screenId;
                this.loadScreen(screenId);
            } else if (e.target.classList.contains('delete-screen')) {
                const screenId = e.target.dataset.screenId;
                this.deleteScreen(screenId);
            }
        });
    }

    setupDragAndDrop() {
        const mobileScreen = document.getElementById('screenArea');

        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
            });
        });

        mobileScreen.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        mobileScreen.addEventListener('drop', (e) => {
            e.preventDefault();
            const componentType = e.dataTransfer.getData('text/plain');
            const rect = mobileScreen.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.addComponent(componentType, x, y);
        });

        mobileScreen.addEventListener('click', (e) => {
            if (e.target === mobileScreen) {
                this.deselectComponent();
            }
        });
    }

    

    setComponentContent(element, component) {
        switch (component.type) {
            case 'button':
                element.textContent = component.text;
                break;
            case 'textbox':
                element.innerHTML = `<input type="text" placeholder="${component.placeholder}" value="${component.text}" style="width: 100%; height: 100%; border: none; outline: none; pointer-events: none;" readonly disabled>`;
                break;
            case 'textarea':
                element.innerHTML = `<textarea placeholder="${component.placeholder}" style="width: 100%; height: 100%; border: none; outline: none; resize: none; pointer-events: none;" readonly disabled>${component.text}</textarea>`;
                break;
            case 'checkbox':
                element.innerHTML = `<input type="checkbox" ${component.checked ? 'checked' : ''} disabled style="margin-right: 8px; pointer-events: none;"><span>${component.text}</span>`;
                break;
            case 'radio':
                element.innerHTML = `<input type="radio" ${component.checked ? 'checked' : ''} disabled style="margin-right: 8px; pointer-events: none;"><span>${component.text}</span>`;
                break;
            case 'image':
                if (component.imagePath) {
                    element.innerHTML = `<img src="${component.imagePath}" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else {
                    element.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">${component.text}</div>`;
                }
                break;
        }
    }

    

    updatePropertyForm() {
        if (this.selectedComponent) {
            document.getElementById('componentX').value = this.selectedComponent.x;
            document.getElementById('componentY').value = this.selectedComponent.y;
            document.getElementById('componentWidth').value = this.selectedComponent.width;
            document.getElementById('componentHeight').value = this.selectedComponent.height;
        }
    }

    markUnsaved() {
        this.hasUnsavedChanges = true;
    }

    

    deselectComponent() {
        if (this.selectedComponent) {
            const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
            if (element) {
                element.classList.remove('selected');
            }
            this.selectedComponent = null;
        }

        this.hidePropertyForm();
        this.showBackgroundControls();
    }

    showPropertyForm(component) {
        document.querySelector('.no-selection').style.display = 'none';
        document.getElementById('propertyForm').style.display = 'block';
        this.hideBackgroundControls();


        document.getElementById('componentType').value = component.type.charAt(0).toUpperCase() + component.type.slice(1);
        document.getElementById('componentX').value = component.x;
        document.getElementById('componentY').value = component.y;
        document.getElementById('componentWidth').value = component.width;
        document.getElementById('componentHeight').value = component.height;
        document.getElementById('componentTextColor').value = component.textColor;

        const checkboxGroup = document.querySelector('.checkbox-group');
        if (component.type === 'checkbox' || component.type === 'radio') {
            checkboxGroup.style.display = 'block';
            document.getElementById('componentChecked').checked = component.checked;
        } else {
            checkboxGroup.style.display = 'none';
        }

        const imageGroup = document.querySelector('.image-group');
        if (component.type === 'image') {
            imageGroup.style.display = 'block';
        } else {
            imageGroup.style.display = 'none';
        }
    }

    hidePropertyForm() {
        document.getElementById('propertyForm').style.display = 'none';
        const noSel = document.getElementById('noSelection');
        if (noSel) noSel.style.display = 'none';
        this.showBackgroundControls();
    }

    updateComponentProperty(propertyId, value) {
        if (!this.selectedComponent) return;

        const property = propertyId.replace('component', '').toLowerCase();
        this.selectedComponent[property] = value;

        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (element) {
            switch (property) {
                case 'x':
                    element.style.left = value + 'px';
                    break;
                case 'y':
                    element.style.top = value + 'px';
                    break;
                case 'width':
                    element.style.width = value + 'px';
                    break;
                case 'height':
                    element.style.height = value + 'px';
                    break;
                case 'zindex':
                    element.style.zIndex = value;
                    break;
                case 'text':
                case 'color':
                case 'checked':
                    this.setComponentContent(element, this.selectedComponent);
                    break;
            }
        }
    }

    deleteSelectedComponent() {
        if (!this.selectedComponent) return;

        Swal.fire({
            icon: 'warning',
            title: 'Delete Component',
            text: 'Are you sure you want to delete this component?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (!result.isConfirmed) return;

            const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
            if (element) {
                element.remove();
            }

            const index = this.components.findIndex(c => c.id === this.selectedComponent.id);
            if (index > -1) {
                this.components.splice(index, 1);
            }

            this.deselectComponent();
            this.markUnsaved();
        });
    }

    bringComponentToFront() {
        if (!this.selectedComponent) return;

        this.selectedComponent.zIndex = Math.max(...this.components.map(c => c.zIndex)) + 1;
        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (element) {
            element.style.zIndex = this.selectedComponent.zIndex;
        }
        const zEl = document.getElementById('componentZIndex');
        if (zEl) zEl.value = this.selectedComponent.zIndex;
        this.markUnsaved();
    }

    sendComponentToBack() {
        if (!this.selectedComponent) return;

        this.selectedComponent.zIndex = Math.min(...this.components.map(c => c.zIndex)) - 1;
        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (element) {
            element.style.zIndex = this.selectedComponent.zIndex;
        }
        const zEl2 = document.getElementById('componentZIndex');
        if (zEl2) zEl2.value = this.selectedComponent.zIndex;
        this.markUnsaved();
    }

    generateId() {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async saveScreen() {
        if (this.components.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Components',
                text: 'Please add at least one component before saving.',
                confirmButtonText: 'OK'
            });
            return;
        }

        let screenName = document.getElementById('currentScreenName').textContent;

        // name length check
        if (screenName && screenName !== 'New Screen' && screenName.trim().length < 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Screen Name',
                text: 'Screen name must be at least 2 characters long.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!screenName || screenName === 'New Screen') {
            const result = await Swal.fire({
                title: 'Enter Screen Name',
                input: 'text',
                inputLabel: 'Screen Name:',
                inputPlaceholder: 'Enter a name for this screen...',
                inputValidator: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Screen name cannot be empty';
                    }
                    if (value.trim() === 'New Screen') {
                        return 'Please enter a different name';
                    }
                    if (value.trim().length < 2) {
                        return 'Screen name must be at least 2 characters';
                    }
                },
                showCancelButton: true,
                confirmButtonText: 'Save Screen',
                cancelButtonText: 'Cancel',
                showLoaderOnConfirm: true,
                preConfirm: async (name) => {
                    if (await this.screenNameExists(name.trim())) {
                        Swal.showValidationMessage('A screen with this name already exists');
                        return false;
                    }
                    return name.trim();
                }
            });

            if (result.isConfirmed && result.value) {
                screenName = result.value;
                document.getElementById('currentScreenName').textContent = screenName;
            } else {
                return;
            }
        }

        this.syncComponentsFromDOM();

        const layoutJson = JSON.stringify({
            components: this.components,
            backgroundColor: this.screenBackgroundColor,
            backgroundImage: this.screenBackgroundImage
        });
        const screenData = {
            applicationId: window.applicationData.id,
            name: screenName,
            layoutJson: layoutJson,
            screenImagePath: null
        };

        try {
            const url = this.currentScreenId ?
                `/api/screens/${this.currentScreenId}` :
                '/api/screens';

            const method = this.currentScreenId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(screenData)
            });

            if (response.ok) {
                const savedScreen = await response.json();
                this.currentScreenId = savedScreen.id;

                if (method === 'POST') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Screen Saved!',
                        text: `Screen "${screenName}" saved successfully!`,
                        confirmButtonText: 'OK',
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Screen Updated!',
                        text: `Screen "${screenName}" updated successfully!`,
                        confirmButtonText: 'OK',
                        timer: 2000,
                        timerProgressBar: true
                    });
                }

                this.loadScreenList();
                return true;
            } else {
                const errorResponse = await response.text();
                let errorMessage = 'Error saving screen';

                try {
                    const errorData = JSON.parse(errorResponse);
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (e) {
                    if (errorResponse.includes('already exists')) {
                        errorMessage = 'A screen with this name already exists. Please choose a different name.';
                    } else {
                        errorMessage = errorResponse;
                    }
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Error Saving Screen',
                    text: errorMessage,
                    confirmButtonText: 'OK'
                });
                return false;
            }
        } catch (error) {
            console.error('Error saving screen:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Saving Screen',
                text: 'Error saving screen: ' + error.message,
                confirmButtonText: 'OK'
            });
            return false;
        }
    }

    

    async loadScreen(screenId) {
        try {
            const response = await fetch(`/api/screens/${screenId}`);
            if (response.ok) {
                const screen = await response.json();
                this.loadScreenLayout(screen);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error Loading Screen',
                text: 'Error loading screen: ' + error.message,
                confirmButtonText: 'OK'
            });
        }
    }

    loadScreenLayout(screen) {
        this.clearComponents();

        try {
            const parsed = JSON.parse(screen.layoutJson);
            let components = [];
            if (Array.isArray(parsed)) {
                components = parsed;
            } else if (parsed && typeof parsed === 'object') {
                components = parsed.components || [];
                if (parsed.backgroundColor) {
                    this.screenBackgroundColor = parsed.backgroundColor;
                }
                if (parsed.backgroundImage) {
                    this.screenBackgroundImage = parsed.backgroundImage;
                }
                this.updateScreenBackground();
                this.updateBackgroundPreview();
                // match the backg color to the same as new loaded screen
                const colorInput = document.getElementById('screenBackgroundColor');
                if (colorInput) {
                    colorInput.value = this.screenBackgroundColor || '#ffffff';
                }
            }

            this.components = components;
            this.currentScreenId = screen.id;

            this.updateCurrentScreenName(screen.name);

            components.forEach(component => {
                this.renderComponent(component);
            });

            Swal.fire({
                icon: 'success',
                title: 'Screen Loaded!',
                text: `Screen \"${screen.name}\" loaded successfully!`,
                confirmButtonText: 'OK',
                timer: 2000,
                timerProgressBar: true
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error Parsing Layout',
                text: 'Error parsing screen layout: ' + error.message,
                confirmButtonText: 'OK'
            });
        }
    }

    clearComponents() {
        const mobileScreen = document.getElementById('screenArea');

        mobileScreen.innerHTML = '';

        this.components = [];
        this.selectedComponent = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isResizing = false;
        this.resizeHandle = null;

        this.deselectComponent();

        document.querySelectorAll('.component-selected').forEach(el => {
            el.classList.remove('component-selected');
        });

        if (!this.currentScreenId) {
            this.updateCurrentScreenName('New Screen');
        }
    }

    loadExistingScreen() {
        if (window.currentScreenData && window.currentScreenData.id) {
            this.loadScreenLayout(window.currentScreenData);
        }
    }

    showNewScreenModal() {
        document.getElementById('newScreenModal').style.display = 'block';
    }

    closeNewScreenModal() {
        document.getElementById('newScreenModal').style.display = 'none';
        document.getElementById('newScreenForm').reset();

        const nameInput = document.getElementById('screenName');
        const submitBtn = document.getElementById('newScreenForm').querySelector('button[type="submit"]');

        nameInput.style.borderColor = '#ddd';
        submitBtn.disabled = false;
        this.hideScreenNameError();
    }

    async createNewScreen() {
        const screenName = document.getElementById('screenName').value.trim();

        if (!screenName) {
            Swal.fire({
                icon: 'warning',
                title: 'Screen Name Required',
                text: 'Please enter a screen name.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (screenName.length < 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Screen Name',
                text: 'Screen name must be at least 2 characters long.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (await this.screenNameExists(screenName)) {
            Swal.fire({
                icon: 'warning',
                title: 'Screen Name Exists',
                text: 'A screen with this name already exists. Please choose a different name.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Start from a clean slate
        this.clearComponents();
        this.currentScreenId = null;
        this.closeNewScreenModal();

        // Reset background state to a blank screen
        this.screenBackgroundColor = '#ffffff';
        this.screenBackgroundImage = null;
        this.updateScreenBackground();
        this.updateBackgroundPreview();
        const imageInput = document.getElementById('screenBackgroundImage');
        if (imageInput) imageInput.value = '';
        const colorInput = document.getElementById('screenBackgroundColor');
        if (colorInput) colorInput.value = '#ffffff';

        // Update UI name; do not auto-add any components
        this.updateCurrentScreenName(screenName);

        Swal.fire({
            icon: 'success',
            title: 'New Screen Created!',
            text: 'New blank screen created. Add components and save when ready.',
            confirmButtonText: 'OK',
            timer: 2000,
            timerProgressBar: true
        });
    }

    async screenNameExists(screenName) {
        try {
            const response = await fetch(`/api/screens/application/${window.applicationData.id}`);
            if (response.ok) {
                const screens = await response.json();
                return screens.some(screen => screen.name.toLowerCase() === screenName.toLowerCase());
            }
        } catch (error) {
            console.error('Error checking screen names:', error);
        }
        return false;
    }

    async deleteScreen(screenId) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Delete Screen',
            text: 'Are you sure you want to delete this screen?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/screens/${screenId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Screen Deleted!',
                    text: 'Screen deleted successfully!',
                    confirmButtonText: 'OK',
                    timer: 2000,
                    timerProgressBar: true
                });
                this.loadScreenList();
            } else {
                const error = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error Deleting Screen',
                    text: 'Error deleting screen: ' + error.message,
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error Deleting Screen',
                text: 'Error deleting screen: ' + error.message,
                confirmButtonText: 'OK'
            });
        }
    }

    async loadScreenList() {
        try {
            console.log('Loading screen list for application:', window.applicationData.id);
            const response = await fetch(`/api/screens/application/${window.applicationData.id}`);
            console.log('Response status:', response.status);

            if (response.ok) {
                const screens = await response.json();
                console.log('Screens loaded:', screens);
                this.renderScreenList(screens);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('Error loading screen list:', error);
        }
    }

    renderScreenList(screens) {
        const screenList = document.getElementById('screenList');
        if (!screenList) return;

        screenList.innerHTML = '';

        if (screens.length === 0) {
            screenList.innerHTML = '<p class="no-screens">No screens yet</p>';
            return;
        }

        screens.forEach(screen => {
            const screenItem = document.createElement('div');
            screenItem.className = 'screen-item';
            screenItem.innerHTML = `
                <span class="screen-name">${screen.name}</span>
                <div class="screen-actions">
                    <button class="btn btn-small btn-primary load-screen" data-screen-id="${screen.id}">Load</button>
                    <button class="btn btn-small btn-danger delete-screen" data-screen-id="${screen.id}">Delete</button>
                </div>
            `;
            screenList.appendChild(screenItem);
        });
    }

    updateCurrentScreenName(name) {
        const currentScreenNameElement = document.getElementById('currentScreenName');
        if (currentScreenNameElement) {
            currentScreenNameElement.textContent = name;
        }
    }

    async validateScreenName(screenName) {
        const nameInput = document.getElementById('screenName');
        const submitBtn = document.getElementById('newScreenForm').querySelector('button[type="submit"]');

        if (!screenName.trim()) {
            nameInput.style.borderColor = '#ddd';
            submitBtn.disabled = false;
            return;
        }

        if (await this.screenNameExists(screenName)) {
            nameInput.style.borderColor = '#dc3545';
            submitBtn.disabled = true;
            this.showScreenNameError('A screen with this name already exists');
        } else {
            nameInput.style.borderColor = '#28a745';
            submitBtn.disabled = false;
            this.hideScreenNameError();
        }
    }

    showScreenNameError(message) {
        let errorDiv = document.getElementById('screenNameError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'screenNameError';
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '12px';
            errorDiv.style.marginTop = '5px';

            const nameInput = document.getElementById('screenName');
            nameInput.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideScreenNameError() {
        const errorDiv = document.getElementById('screenNameError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    setupScreenResizing() {
        const resizeHandle = document.getElementById('resizeHandle');
        if (!resizeHandle) return;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isScreenResizing = true;
            this.screenResizeStartY = e.clientY;
            this.screenResizeStartHeight = parseInt(getComputedStyle(document.getElementById('screenArea')).height);

            document.addEventListener('mousemove', this.handleScreenResize.bind(this));
            document.addEventListener('mouseup', this.stopScreenResize.bind(this));
        });
    }

    handleScreenResize(e) {
        if (!this.isScreenResizing) return;

        const deltaY = e.clientY - this.screenResizeStartY;
        const newHeight = Math.max(400, Math.min(1000, this.screenResizeStartHeight + deltaY));

        const screenArea = document.getElementById('screenArea');
        const mobileDevice = document.querySelector('.mobile-device');

        screenArea.style.height = `${newHeight}px`;
        mobileDevice.style.height = `${newHeight + 60}px`;

        this.updateComponentHeightConstraints(newHeight);
    }

    stopScreenResize() {
        this.isScreenResizing = false;
        document.removeEventListener('mousemove', this.handleScreenResize.bind(this));
        document.removeEventListener('mouseup', this.stopScreenResize.bind(this));
    }

    updateComponentHeightConstraints(maxHeight) {
        const heightInput = document.getElementById('componentHeight');
        if (heightInput) {
            heightInput.max = maxHeight;
        }
    }

    setupScreenBackground() {
        const colorInput = document.getElementById('screenBackgroundColor');
        const imageInput = document.getElementById('screenBackgroundImage');
        const clearBtn = document.getElementById('clearBackgroundImageBtn');

        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                this.screenBackgroundColor = e.target.value;
                this.updateScreenBackground();
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleBackgroundImageUpload(e.target.files[0]);
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.screenBackgroundImage = null;
                const inputEl = document.getElementById('screenBackgroundImage');
                if (inputEl) inputEl.value = '';
                this.updateScreenBackground();
                this.updateBackgroundPreview();
            });
        }
    }

    handleBackgroundImageUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid File Type',
                text: 'Please select an image file',
                confirmButtonText: 'OK'
            });
            const inputEl = document.getElementById('screenBackgroundImage');
            if (inputEl) inputEl.value = '';
            this.screenBackgroundImage = null;
            this.updateBackgroundPreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.screenBackgroundImage = e.target.result;
            this.updateBackgroundPreview();
        };
        reader.readAsDataURL(file);
    }

    updateScreenBackground() {
        const screenArea = document.getElementById('screenArea');
        if (!screenArea) return;
        this.ensureBackgroundLayer();

        screenArea.style.backgroundColor = this.screenBackgroundColor || '#ffffff';
        const colorInput = document.getElementById('screenBackgroundColor');
        if (colorInput && colorInput.value !== (this.screenBackgroundColor || '#ffffff')) {
            colorInput.value = this.screenBackgroundColor || '#ffffff';
        }
        if (this.bgImg) {
            this.bgImg.removeAttribute('src');
            this.bgImg.style.display = 'none';
        }
        if (this.bgLayer) {
            this.bgLayer.style.backgroundImage = '';
        }
        screenArea.classList.remove('has-background-image');
    }

    showBackgroundControls() {
        const bg = document.getElementById('screenBackgroundSection');
        if (bg) bg.style.display = 'block';
    }

    hideBackgroundControls() {
        const bg = document.getElementById('screenBackgroundSection');
        if (bg) bg.style.display = 'none';
    }

    updateBackgroundPreview() {
        const preview = document.getElementById('backgroundPreview');
        if (!preview) return;

        if (this.screenBackgroundImage) {
            preview.style.background = `url(${this.screenBackgroundImage}) center/cover no-repeat`;
            preview.classList.add('has-image');
            preview.innerHTML = '<span>Background image loaded</span>';
        } else {
            preview.style.background = 'none';
            preview.classList.remove('has-image');
            preview.innerHTML = '<span>No image selected</span>';
        }
    }

    setupContextMenu() {
        this.createContextMenu();
        this.setupComponentInteraction();
    }

    createContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="delete">Delete</div>
            <div class="context-menu-item" data-action="bring-front">Bring to Front</div>
            <div class="context-menu-item" data-action="send-back">Send to Back</div>
        `;
        document.body.appendChild(this.contextMenu);

        this.contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action && this.selectedComponent) {
                this.handleContextMenuAction(action);
            }
            this.hideContextMenu();
        });
    }

    handleContextMenuAction(action) {
        switch (action) {
            case 'delete':
                this.deleteSelectedComponent();
                break;
            case 'bring-front':
                this.bringComponentToFront();
                break;
            case 'send-back':
                this.sendComponentToBack();
                break;
        }
    }

    showContextMenu(e, component) {
        e.preventDefault();
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = e.clientX + 'px';
        this.contextMenu.style.top = e.clientY + 'px';
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.style.display = 'none';
        }
    }

    setupComponentInteraction() {
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.draggable-component')) {
                e.preventDefault();
                const component = e.target.closest('.draggable-component');
                this.selectComponent(component);
                this.showContextMenu(e, component);
            }
        });
    }

    selectComponent(component) {
        if (this.selectedComponent) {
            const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
            if (element) {
                element.classList.remove('selected');
            }
            this.removeResizeHandles();
        }

        this.selectedComponent = component;
        const element = document.querySelector(`[data-component-id="${component.id}"]`);
        if (element) {
            element.classList.add('selected');
            this.addResizeHandles(element);
        }
        this.showPropertyForm(component);
    }

    addResizeHandles(component) {
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `component-resize-handle ${pos}`;
            handle.dataset.position = pos;
            component.appendChild(handle);

            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.startComponentResize(e, pos);
            });
        });
    }

    removeResizeHandles() {
        if (this.selectedComponent) {
            const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
            if (element) {
                element.querySelectorAll('.component-resize-handle').forEach(handle => {
                    handle.remove();
                });
            }
        }
    }

    startComponentResize(e, position) {
        e.preventDefault();
        this.isComponentResizing = true;
        this.componentResizeHandle = position;

        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const screenRect = document.getElementById('screenArea').getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        const startLeft = rect.left - screenRect.left;
        const startTop = rect.top - screenRect.top;
        const startRight = startLeft + startWidth;
        const startBottom = startTop + startHeight;

        const minW = 50;
        const minH = 30;

        const handleMouseMove = (e) => {
            if (!this.isComponentResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = startLeft;
            let newTop = startTop;
            let newRight = startRight;
            let newBottom = startBottom;

            if (position.includes('e')) {
                newRight = startRight + deltaX;
                newRight = Math.max(startLeft + minW, Math.min(newRight, screenRect.width));
            }
            if (position.includes('w')) {
                newLeft = startLeft + deltaX;
                newLeft = Math.min(startRight - minW, Math.max(0, newLeft));
            }

            if (position.includes('s')) {
                newBottom = startBottom + deltaY;
                newBottom = Math.max(startTop + minH, Math.min(newBottom, screenRect.height));
            }
            if (position.includes('n')) {
                newTop = startTop + deltaY;
                newTop = Math.min(startBottom - minH, Math.max(0, newTop));
            }

            const newWidth = Math.round(newRight - newLeft);
            const newHeight = Math.round(newBottom - newTop);

            element.style.left = Math.round(newLeft) + 'px';
            element.style.top = Math.round(newTop) + 'px';
            element.style.width = Math.max(minW, newWidth) + 'px';
            element.style.height = Math.max(minH, newHeight) + 'px';

            this.updatePropertyFormFromComponent();
        };

        const handleMouseUp = () => {
            this.isComponentResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            this.updateComponentData();
            this.markUnsaved();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    updatePropertyFormFromComponent() {
        if (!this.selectedComponent) return;

        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const screenRect = document.getElementById('screenArea').getBoundingClientRect();

        const x = rect.left - screenRect.left;
        const y = rect.top - screenRect.top;
        const width = rect.width;
        const height = rect.height;

        const xInput = document.getElementById('componentX');
        const yInput = document.getElementById('componentY');
        const widthInput = document.getElementById('componentWidth');
        const heightInput = document.getElementById('componentHeight');

        if (xInput) xInput.value = Math.round(x);
        if (yInput) yInput.value = Math.round(y);
        if (widthInput) widthInput.value = Math.round(width);
        if (heightInput) heightInput.value = Math.round(height);

        this.updateComponentData();
    }

    updateComponentData() {
        if (!this.selectedComponent) return;

        const componentId = this.selectedComponent.id;
        const component = this.components.find(c => c.id === componentId);

        if (component) {
            const element = document.querySelector(`[data-component-id="${componentId}"]`);
            if (element) {
                const rect = element.getBoundingClientRect();
                const screenRect = document.getElementById('screenArea').getBoundingClientRect();

                component.x = Math.round(rect.left - screenRect.left);
                component.y = Math.round(rect.top - screenRect.top);
                component.width = Math.round(rect.width);
                component.height = Math.round(rect.height);
            }
        }
    }

    syncComponentsFromDOM() {
        const screen = document.getElementById('screenArea');
        if (!screen) return;
        const screenRect = screen.getBoundingClientRect();
        const nodes = screen.querySelectorAll('[data-component-id]');
        nodes.forEach(el => {
            const id = el.getAttribute('data-component-id');
            const model = this.components.find(c => c.id === id);
            if (!model) return;
            const r = el.getBoundingClientRect();
            model.x = Math.round(r.left - screenRect.left);
            model.y = Math.round(r.top - screenRect.top);
            model.width = Math.round(r.width);
            model.height = Math.round(r.height);
        });
    }

    addComponent(type, x, y, width = 100, height = 50) {
        const component = {
            id: this.generateId(),
            type: type,
            x: x,
            y: y,
            width: width,
            height: height,
            text: this.getDefaultText(type),
            placeholder: this.getDefaultPlaceholder(type),
            textColor: '#000000',
            checked: false,
            imagePath: null,
            zIndex: this.components.length
        };

        this.components.push(component);
        this.renderComponent(component);

        const componentElement = document.querySelector(`[data-component-id="${component.id}"]`);
        if (componentElement) {
            this.selectComponent(component);
        }

        this.markUnsaved();
        return component;
    }

    renderComponent(component) {
        const mobileScreen = document.getElementById('screenArea');
        const componentElement = document.createElement('div');

        componentElement.className = `draggable-component component-${component.type}`;
        componentElement.dataset.componentId = component.id;
        componentElement.style.left = component.x + 'px';
        componentElement.style.top = component.y + 'px';
        componentElement.style.width = component.width + 'px';
        componentElement.style.height = component.height + 'px';
        componentElement.style.color = component.textColor;
        componentElement.style.zIndex = component.zIndex;

        this.setComponentContent(componentElement, component);

        componentElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(component);
        });

        componentElement.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('component-resize-handle')) return;
            this.startComponentDrag(e, componentElement);
        });

        mobileScreen.appendChild(componentElement);
    }

    startComponentDrag(e, component) {
        e.preventDefault();
        this.isComponentDragging = true;
        const compId = component.dataset && component.dataset.componentId;
        if (compId) {
            const data = this.components.find(c => c.id === compId);
            if (data) {
                this.selectedComponent = data;
            }
        }

        const rect = component.getBoundingClientRect();
        const screenRect = document.getElementById('screenArea').getBoundingClientRect();

        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        const handleMouseMove = (e) => {
            if (!this.isComponentDragging) return;

            const screenRect = document.getElementById('screenArea').getBoundingClientRect();
            let newX = e.clientX - screenRect.left - this.dragOffset.x;
            let newY = e.clientY - screenRect.top - this.dragOffset.y;

            newX = Math.max(0, Math.min(screenRect.width - component.offsetWidth, newX));
            newY = Math.max(0, Math.min(screenRect.height - component.offsetHeight, newY));

            component.style.left = newX + 'px';
            component.style.top = newY + 'px';
            this.markUnsaved();
        };

        const handleMouseUp = () => {
            this.isComponentDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            this.updateComponentData();
            this.updatePropertyFormFromComponent();
            this.markUnsaved();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    getDefaultText(type) {
        const defaults = {
            button: 'Button',
            textbox: 'Text Input',
            textarea: 'Text Area',
            checkbox: 'Checkbox',
            radio: 'Radio Button',
            image: 'Image'
        };
        return defaults[type] || 'Component';
    }

    getDefaultPlaceholder(type) {
        const defaults = {
            textbox: 'Enter text...',
            textarea: 'Enter text here...'
        };
        return defaults[type] || '';
    }

    setupPageNavigationWarning() {
        let hasUnsavedChanges = false;
        this.hasUnsavedChanges = false;
        this.suppressBeforeUnload = false;

        const trackChanges = () => {
            hasUnsavedChanges = true;
            this.hasUnsavedChanges = true;
        };

        const resetChanges = () => {
            hasUnsavedChanges = false;
            this.hasUnsavedChanges = false;
        };

        this.originalAddComponent = this.addComponent;
        this.originalSaveScreen = this.saveScreen;

        this.addComponent = function (type, x, y) {
            const component = this.originalAddComponent.call(this, type, x, y);
            trackChanges();
            return component;
        };

        this.saveScreen = async function () {
            const result = await this.originalSaveScreen();
            if (result) {
                resetChanges();
            }
            return result;
        };

        window.addEventListener('beforeunload', (e) => {
            if ((hasUnsavedChanges || this.hasUnsavedChanges) && !this.suppressBeforeUnload) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        const backLink = document.querySelector('a[href="/"]');
        const intercept = async (e) => {
            if (!(hasUnsavedChanges || this.hasUnsavedChanges)) return;
            e.preventDefault();
            const result = await Swal.fire({
                title: 'Leave this page?',
                text: 'Your changes will be lost and cannot be recovered. Are you sure you want to leave this page?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Leave Page',
                cancelButtonText: 'Stay',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d'
            });
            if (result.isConfirmed) {
                this.suppressBeforeUnload = true;
                window.location.href = '/';
            }
        };
        if (backLink) {
            backLink.addEventListener('click', intercept);
        }
        document.addEventListener('click', (e) => {
            const link = e.target.closest && e.target.closest('a[href="/"]');
            if (link) {
                intercept(e);
            }
        });

        const originalUpdateComponentProperty = this.updateComponentProperty;
        this.updateComponentProperty = function (property, value) {
            originalUpdateComponentProperty.call(this, property, value);
            trackChanges();
        };

        const originalDeleteSelectedComponent = this.deleteSelectedComponent;
        this.deleteSelectedComponent = function () {
            originalDeleteSelectedComponent.call(this);
            trackChanges();
        };

        const originalUpdateScreenBackground = this.updateScreenBackground;
        this.updateScreenBackground = function () {
            originalUpdateScreenBackground.call(this);
            trackChanges();
        };
    }

    // Logout Confirm
    setupLogoutConfirmation() {
        const logoutLink = document.querySelector('a[href="/logout"]');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();

                Swal.fire({
                    title: 'Logout Confirmation',
                    text: 'Are you sure you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#007bff',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Yes, Logout',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Submit logout form
                        this.suppressBeforeUnload = true;
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = '/logout';
                        document.body.appendChild(form);
                        form.submit();
                    }
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new ScreenDesigner();
});

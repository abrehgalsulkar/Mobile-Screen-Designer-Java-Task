// Mobile Screen Designer functionality
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

        // check if screen name is already taken
        document.getElementById('screenName').addEventListener('input', (e) => {
            this.validateScreenName(e.target.value);
        });

        this.setupPageNavigationWarning();

        this.setupLogoutConfirmation();
    }

    setupPropertyFormListeners() {
        const inputs = ['componentX', 'componentY', 'componentWidth', 'componentHeight', 'componentText', 'componentPlaceholder', 'componentTextColor', 'componentZIndex'];
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

    addComponent(type, x, y) {
        const component = {
            id: this.generateId(),
            type: type,
            x: Math.max(0, Math.min(x, 375 - 100)),
            y: Math.max(0, Math.min(y, 667 - 50)),
            width: 100,
            height: 50,
            text: this.getDefaultText(type),
            placeholder: '',
            textColor: '#000000',
            checked: false,
            imagePath: '',
            zIndex: this.components.length
        };

        this.components.push(component);
        this.renderComponent(component);
        this.selectComponent(component);
    }

    getDefaultText(type) {
        const defaults = {
            button: 'Button',
            textbox: '',
            textarea: '',
            checkbox: 'Checkbox',
            radio: 'Radio',
            image: 'Image'
        };
        return defaults[type] || '';
    }

    renderComponent(component) {
        const mobileScreen = document.getElementById('screenArea');

        const element = document.createElement('div');
        element.className = `draggable-component component-${component.type}`;
        element.dataset.componentId = component.id;
        element.style.cssText = `
            left: ${component.x}px;
            top: ${component.y}px;
            width: ${component.width}px;
            height: ${component.height}px;
            z-index: ${component.zIndex};
        `;

        this.setComponentContent(element, component);

        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(component);
        });

        this.makeComponentDraggable(element, component);

        this.addResizeHandles(element, component);

        mobileScreen.appendChild(element);
    }

    setComponentContent(element, component) {
        switch (component.type) {
            case 'button':
                element.textContent = component.text;
                break;
            case 'textbox':
                element.innerHTML = `<input type="text" placeholder="${component.placeholder}" value="${component.text}" style="width: 100%; height: 100%; border: none; outline: none;">`;
                break;
            case 'textarea':
                element.innerHTML = `<textarea placeholder="${component.placeholder}" style="width: 100%; height: 100%; border: none; outline: none; resize: none;">${component.text}</textarea>`;
                break;
            case 'checkbox':
                element.innerHTML = `<input type="checkbox" ${component.checked ? 'checked' : ''} style="margin-right: 8px;"><span>${component.text}</span>`;
                break;
            case 'radio':
                element.innerHTML = `<input type="radio" ${component.checked ? 'checked' : ''} style="margin-right: 8px;"><span>${component.text}</span>`;
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

    makeComponentDraggable(element, component) {
        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            this.isDragging = true;
            this.selectedComponent = component;
            this.dragOffset.x = e.clientX - component.x;
            this.dragOffset.y = e.clientY - component.y;

            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        });
    }

    addResizeHandles(element, component) {
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            element.appendChild(handle);

            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.isResizing = true;
                this.resizeHandle = pos;
                this.selectedComponent = component;

                document.addEventListener('mousemove', this.handleResizeMove.bind(this));
                document.addEventListener('mouseup', this.handleResizeUp.bind(this));
            });
        });
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedComponent) return;

        const mobileScreen = document.getElementById('screenArea');
        const rect = mobileScreen.getBoundingClientRect();

        let newX = e.clientX - rect.left - this.dragOffset.x;
        let newY = e.clientY - rect.top - this.dragOffset.y;

        newX = Math.max(0, Math.min(newX, 375 - this.selectedComponent.width));
        newY = Math.max(0, Math.min(newY, 667 - this.selectedComponent.height));

        this.selectedComponent.x = newX;
        this.selectedComponent.y = newY;

        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (element) {
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        }

        this.updatePropertyForm();
    }

    handleMouseUp() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleResizeMove(e) {
        if (!this.isResizing || !this.selectedComponent) return;

        const mobileScreen = document.getElementById('screenArea');
        const rect = mobileScreen.getBoundingClientRect();
        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);

        if (!element) return;

        let newWidth = this.selectedComponent.width;
        let newHeight = this.selectedComponent.height;

        if (this.resizeHandle.includes('e')) {
            newWidth = Math.max(50, e.clientX - rect.left - this.selectedComponent.x);
        }
        if (this.resizeHandle.includes('w')) {
            const rightEdge = this.selectedComponent.x + this.selectedComponent.width;
            newWidth = Math.max(50, rightEdge - (e.clientX - rect.left));
            if (newWidth !== this.selectedComponent.width) {
                this.selectedComponent.x = e.clientX - rect.left;
            }
        }
        if (this.resizeHandle.includes('s')) {
            newHeight = Math.max(30, e.clientY - rect.top - this.selectedComponent.y);
        }
        if (this.resizeHandle.includes('n')) {
            const bottomEdge = this.selectedComponent.y + this.selectedComponent.height;
            newHeight = Math.max(30, bottomEdge - (e.clientY - rect.top));
            if (newHeight !== this.selectedComponent.height) {
                this.selectedComponent.y = e.clientY - rect.top;
            }
        }

        newWidth = Math.min(newWidth, 375 - this.selectedComponent.x);
        newHeight = Math.min(newHeight, 667 - this.selectedComponent.y);

        this.selectedComponent.width = newWidth;
        this.selectedComponent.height = newHeight;

        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
        element.style.left = this.selectedComponent.x + 'px';
        element.style.top = this.selectedComponent.y + 'px';

        this.updatePropertyForm();
    }

    handleResizeUp() {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.handleResizeMove);
        document.removeEventListener('mouseup', this.handleResizeUp);
    }

    updatePropertyForm() {
        if (this.selectedComponent) {
            document.getElementById('componentX').value = this.selectedComponent.x;
            document.getElementById('componentY').value = this.selectedComponent.y;
            document.getElementById('componentWidth').value = this.selectedComponent.width;
            document.getElementById('componentHeight').value = this.selectedComponent.height;
        }
    }

    selectComponent(component) {
        this.deselectComponent();
        this.selectedComponent = component;

        const element = document.querySelector(`[data-component-id="${component.id}"]`);
        if (element) {
            element.classList.add('selected');
        }

        this.showPropertyForm(component);
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
    }

    showPropertyForm(component) {
        document.querySelector('.no-selection').style.display = 'none';
        document.getElementById('propertyForm').style.display = 'block';


        document.getElementById('componentType').value = component.type.charAt(0).toUpperCase() + component.type.slice(1);
        document.getElementById('componentX').value = component.x;
        document.getElementById('componentY').value = component.y;
        document.getElementById('componentWidth').value = component.width;
        document.getElementById('componentHeight').value = component.height;
        document.getElementById('componentText').value = component.text;
        document.getElementById('componentPlaceholder').value = component.placeholder;
        document.getElementById('componentTextColor').value = component.textColor;
        document.getElementById('componentZIndex').value = component.zIndex;

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
        document.querySelector('.no-selection').style.display = 'block';
        document.getElementById('propertyForm').style.display = 'none';
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
                case 'placeholder':
                case 'color':
                case 'checked':
                    this.setComponentContent(element, this.selectedComponent);
                    break;
            }
        }
    }

    deleteSelectedComponent() {
        if (!this.selectedComponent) return;

        if (confirm('Are you sure you want to delete this component?')) {
            const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
            if (element) {
                element.remove();
            }

            const index = this.components.findIndex(c => c.id === this.selectedComponent.id);
            if (index > -1) {
                this.components.splice(index, 1);
            }

            this.deselectComponent();
        }
    }

    bringComponentToFront() {
        if (!this.selectedComponent) return;

        this.selectedComponent.zIndex = Math.max(...this.components.map(c => c.zIndex)) + 1;
        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (element) {
            element.style.zIndex = this.selectedComponent.zIndex;
        }
        document.getElementById('componentZIndex').value = this.selectedComponent.zIndex;
    }

    sendComponentToBack() {
        if (!this.selectedComponent) return;

        this.selectedComponent.zIndex = Math.min(...this.components.map(c => c.zIndex)) - 1;
        const element = document.querySelector(`[data-component-id="${this.selectedComponent.id}"]`);
        if (element) {
            element.style.zIndex = this.selectedComponent.zIndex;
        }
        document.getElementById('componentZIndex').value = this.selectedComponent.zIndex;
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
st
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

        const layoutJson = JSON.stringify(this.components);
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
            }
        } catch (error) {
            console.error('Error saving screen:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Saving Screen',
                text: 'Error saving screen: ' + error.message,
                confirmButtonText: 'OK'
            });
        }
    }

    async createScreen(name, layoutJson) {
        try {
            const response = await fetch('/api/screens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId: window.applicationData.id,
                    name: name,
                    layoutJson: layoutJson,
                    screenImagePath: null
                })
            });

            if (response.ok) {
                const screen = await response.json();
                this.currentScreenId = screen.id;
                this.updateCurrentScreenName(name);
                Swal.fire({
                    icon: 'success',
                    title: 'Screen Saved!',
                    text: 'Screen saved successfully!',
                    confirmButtonText: 'OK',
                    timer: 2000,
                    timerProgressBar: true
                });
                this.loadScreenList();
            } else {
                const error = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error Saving Screen',
                    text: 'Error saving screen: ' + error,
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error Saving Screen',
                text: 'Error saving screen: ' + error.message,
                confirmButtonText: 'OK'
            });
        }
    }

    async updateScreen(screenId, name, layoutJson) {
        try {
            const response = await fetch(`/api/screens/${screenId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    layoutJson: layoutJson,
                    screenImagePath: null
                })
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Screen Updated!',
                    text: 'Screen updated successfully!',
                    confirmButtonText: 'OK',
                    timer: 2000,
                    timerProgressBar: true
                });
                this.loadScreenList();
            } else {
                const error = await response.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error Updating Screen',
                    text: 'Error updating screen: ' + error,
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error Updating Screen',
                text: 'Error updating screen: ' + error.message,
                confirmButtonText: 'OK'
            });
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
            const components = JSON.parse(screen.layoutJson);
            this.components = components;
            this.currentScreenId = screen.id;

            this.updateCurrentScreenName(screen.name);

            components.forEach(component => {
                this.renderComponent(component);
            });

            Swal.fire({
                icon: 'success',
                title: 'Screen Loaded!',
                text: `Screen "${screen.name}" loaded successfully!`,
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

        if (await this.screenNameExists(screenName)) {
            Swal.fire({
                icon: 'warning',
                title: 'Screen Name Exists',
                text: 'A screen with this name already exists. Please choose a different name.',
                confirmButtonText: 'OK'
            });
            return;
        }

        this.clearComponents();
        this.currentScreenId = null;
        this.closeNewScreenModal();

        this.updateCurrentScreenName(screenName);

        this.addComponent('button', 50, 50);

        Swal.fire({
            icon: 'success',
            title: 'New Screen Created!',
            text: 'New screen created! Add components and save when ready.',
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
        mobileDevice.style.height = `${newHeight + 60}px`; // 60px for header + footer

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
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.screenBackgroundImage = e.target.result;
            this.updateScreenBackground();
            this.updateBackgroundPreview();
        };
        reader.readAsDataURL(file);
    }

    updateScreenBackground() {
        const screenArea = document.getElementById('screenArea');
        if (!screenArea) return;

        if (this.screenBackgroundImage) {
            screenArea.style.background = `url(${this.screenBackgroundImage}) center/cover no-repeat`;
            screenArea.classList.add('has-background-image');
        } else {
            screenArea.style.background = this.screenBackgroundColor;
            screenArea.classList.remove('has-background-image');
        }
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
            this.selectedComponent.classList.remove('selected');
            this.removeResizeHandles();
        }

        this.selectedComponent = component;
        component.classList.add('selected');
        this.addResizeHandles(component);
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
            this.selectedComponent.querySelectorAll('.component-resize-handle').forEach(handle => {
                handle.remove();
            });
        }
    }

    startComponentResize(e, position) {
        e.preventDefault();
        this.isComponentResizing = true;
        this.componentResizeHandle = position;

        const rect = this.selectedComponent.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        const startLeft = rect.left;
        const startTop = rect.top;

        const handleMouseMove = (e) => {
            if (!this.isComponentResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            switch (position) {
                case 'se':
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    break;
                case 'sw':
                    newWidth = Math.max(50, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    newLeft = startLeft + deltaX;
                    break;
                case 'ne':
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newTop = startTop + deltaY;
                    break;
                case 'nw':
                    newWidth = Math.max(50, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newLeft = startLeft + deltaX;
                    newTop = startTop + deltaY;
                    break;
            }

            this.selectedComponent.style.width = newWidth + 'px';
            this.selectedComponent.style.height = newHeight + 'px';
            this.selectedComponent.style.left = newLeft + 'px';
            this.selectedComponent.style.top = newTop + 'px';

            this.updatePropertyFormFromComponent();
        };

        const handleMouseUp = () => {
            this.isComponentResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    updatePropertyFormFromComponent() {
        if (!this.selectedComponent) return;

        const rect = this.selectedComponent.getBoundingClientRect();
        const screenRect = document.getElementById('screenArea').getBoundingClientRect();

        const x = rect.left - screenRect.left;
        const y = rect.top - screenRect.top;
        const width = rect.width;
        const height = rect.height;

        // Update form inputs
        const xInput = document.getElementById('componentX');
        const yInput = document.getElementById('componentY');
        const widthInput = document.getElementById('componentWidth');
        const heightInput = document.getElementById('componentHeight');

        if (xInput) xInput.value = Math.round(x);
        if (yInput) yInput.value = Math.round(y);
        if (widthInput) widthInput.value = Math.round(width);
        if (heightInput) heightInput.value = Math.round(height);

        // Update component data
        this.updateComponentData();
    }

    updateComponentData() {
        if (!this.selectedComponent) return;

        const componentId = this.selectedComponent.dataset.componentId;
        const component = this.components.find(c => c.id === componentId);

        if (component) {
            const rect = this.selectedComponent.getBoundingClientRect();
            const screenRect = document.getElementById('screenArea').getBoundingClientRect();

            component.x = Math.round(rect.left - screenRect.left);
            component.y = Math.round(rect.top - screenRect.top);
            component.width = Math.round(rect.width);
            component.height = Math.round(rect.height);
        }
    }

    // Override the existing addComponent method to add resize handles
    addComponent(type, x, y, width = 100, height = 50) {
        const component = {
            id: Date.now().toString(),
            type: type,
            x: x,
            y: y,
            width: width,
            height: height,
            text: this.getDefaultText(type),
            placeholder: this.getDefaultPlaceholder(type),
            textColor: '#000000',
            checked: false,
            imagePath: null
        };

        this.components.push(component);
        this.renderComponent(component);

        // Select the newly added component
        const componentElement = document.querySelector(`[data-component-id="${component.id}"]`);
        if (componentElement) {
            this.selectComponent(componentElement);
        }

        return component;
    }

    // Override the existing renderComponent method to add resize handles
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

        // Set content based on type
        if (component.type === 'image' && component.imagePath) {
            componentElement.style.backgroundImage = `url(${component.imagePath})`;
            componentElement.style.backgroundSize = 'cover';
            componentElement.style.backgroundPosition = 'center';
        } else {
            componentElement.textContent = component.text || this.getDefaultText(component.type);
        }

        // Add event listeners
        componentElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(componentElement);
        });

        // Add drag functionality
        componentElement.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('component-resize-handle')) return;
            this.startComponentDrag(e, componentElement);
        });

        mobileScreen.appendChild(componentElement);
    }

    startComponentDrag(e, component) {
        e.preventDefault();
        this.isComponentDragging = true;

        const rect = component.getBoundingClientRect();
        const screenRect = document.getElementById('screenArea').getBoundingClientRect();

        this.dragOffset = {
            x: e.clientX - rect.left + screenRect.left,
            y: e.clientY - rect.top + screenRect.top
        };

        const handleMouseMove = (e) => {
            if (!this.isComponentDragging) return;

            const screenRect = document.getElementById('screenArea').getBoundingClientRect();
            let newX = e.clientX - this.dragOffset.x;
            let newY = e.clientY - this.dragOffset.y;

            // Constrain to screen bounds
            newX = Math.max(0, Math.min(screenRect.width - component.offsetWidth, newX));
            newY = Math.max(0, Math.min(screenRect.height - component.offsetHeight, newY));

            component.style.left = newX + 'px';
            component.style.top = newY + 'px';
        };

        const handleMouseUp = () => {
            this.isComponentDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Update component data and property form
            this.updateComponentData();
            this.updatePropertyFormFromComponent();
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

    // Page Navigation Warning for unsaved changes
    setupPageNavigationWarning() {
        let hasUnsavedChanges = false;

        // Track changes to components
        const trackChanges = () => {
            hasUnsavedChanges = true;
        };

        // Reset changes flag when screen is saved
        const resetChanges = () => {
            hasUnsavedChanges = false;
        };

        // Store original methods first
        this.originalAddComponent = this.addComponent;
        this.originalSaveScreen = this.saveScreen;

        // Add change tracking to component modifications
        this.addComponent = function (type, x, y) {
            const component = this.originalAddComponent.call(this, type, x, y);
            trackChanges();
            return component;
        };

        // Override save screen to reset changes flag
        this.saveScreen = async function () {
            const result = await this.originalSaveScreen();
            if (result) {
                resetChanges();
            }
            return result;
        };

        // Add beforeunload event listener
        window.addEventListener('beforeunload', (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Track changes when components are modified
        const originalUpdateComponentProperty = this.updateComponentProperty;
        this.updateComponentProperty = function (property, value) {
            originalUpdateComponentProperty.call(this, property, value);
            trackChanges();
        };

        // Track changes when components are deleted
        const originalDeleteSelectedComponent = this.deleteSelectedComponent;
        this.deleteSelectedComponent = function () {
            originalDeleteSelectedComponent.call(this);
            trackChanges();
        };

        // Track changes when screen background is modified
        const originalUpdateScreenBackground = this.updateScreenBackground;
        this.updateScreenBackground = function () {
            originalUpdateScreenBackground.call(this);
            trackChanges();
        };
    }

    // Logout Confirmation
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

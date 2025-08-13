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

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingScreen();
        this.setupDragAndDrop();
        this.loadScreenList(); // Load screen list on initialization
    }

    setupEventListeners() {
        // Save screen button
        document.getElementById('saveScreenBtn').addEventListener('click', () => {
            this.saveScreen();
        });

        // New screen button
        document.getElementById('newScreenBtn').addEventListener('click', () => {
            this.showNewScreenModal();
        });

        // Property form inputs
        this.setupPropertyFormListeners();

        // Screen actions
        this.setupScreenActionListeners();

        // Modal close - click outside modal to close
        document.getElementById('newScreenModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('newScreenModal')) {
                this.closeNewScreenModal();
            }
        });

        // New screen form
        document.getElementById('newScreenForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewScreen();
        });

        // Cancel button for new screen modal
        document.getElementById('cancelScreenBtn').addEventListener('click', () => {
            this.closeNewScreenModal();
        });
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

        // Checkbox
        const checkbox = document.getElementById('componentChecked');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                this.updateComponentProperty('componentChecked', e.target.checked);
            });
        }

        // Action buttons
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

        // Component toolbox drag start
        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
            });
        });

        // Mobile screen drop zone
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

        // Click to deselect
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
            x: Math.max(0, Math.min(x, 375 - 100)), // Constrain to screen bounds
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

        // Set content based on type
        this.setComponentContent(element, component);

        // Add event listeners
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(component);
        });

        // Make draggable
        this.makeComponentDraggable(element, component);

        // Add resize handles
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
                return; // Don't drag when clicking on input elements
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

        const mobileScreen = document.getElementById('mobileScreen');
        const rect = mobileScreen.getBoundingClientRect();

        let newX = e.clientX - rect.left - this.dragOffset.x;
        let newY = e.clientY - rect.top - this.dragOffset.y;

        // Constrain to screen bounds
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

        const mobileScreen = document.getElementById('mobileScreen');
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

        // Constrain to screen bounds
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

        // Populate form fields
        document.getElementById('componentType').value = component.type.charAt(0).toUpperCase() + component.type.slice(1);
        document.getElementById('componentX').value = component.x;
        document.getElementById('componentY').value = component.y;
        document.getElementById('componentWidth').value = component.width;
        document.getElementById('componentHeight').value = component.height;
        document.getElementById('componentText').value = component.text;
        document.getElementById('componentPlaceholder').value = component.placeholder;
        document.getElementById('componentTextColor').value = component.textColor;
        document.getElementById('componentZIndex').value = component.zIndex;

        // Show/hide checkbox group based on component type
        const checkboxGroup = document.querySelector('.checkbox-group');
        if (component.type === 'checkbox' || component.type === 'radio') {
            checkboxGroup.style.display = 'block';
            document.getElementById('componentChecked').checked = component.checked;
        } else {
            checkboxGroup.style.display = 'none';
        }

        // Show/hide image group based on component type
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

        // Update visual representation
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

    saveScreen() {
        if (this.components.length === 0) {
            alert('Please add at least one component before saving.');
            return;
        }

        // Get screen name from current screen data or prompt for new name
        let screenName = window.currentScreenData?.name || '';
        if (!screenName || screenName === 'New Screen') {
            screenName = prompt('Enter screen name:');
            if (!screenName) return;
        }

        const layoutJson = JSON.stringify(this.components);

        if (this.currentScreenId) {
            this.updateScreen(this.currentScreenId, screenName, layoutJson);
        } else {
            this.createScreen(screenName, layoutJson);
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
                alert('Screen saved successfully!');
                // Update screen list instead of reloading
                this.loadScreenList();
            } else {
                const error = await response.text();
                alert('Error saving screen: ' + error);
            }
        } catch (error) {
            alert('Error saving screen: ' + error.message);
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
                alert('Screen updated successfully!');
                // Update screen list after update
                this.loadScreenList();
            } else {
                const error = await response.text();
                alert('Error updating screen: ' + error);
            }
        } catch (error) {
            alert('Error updating screen: ' + error.message);
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
            alert('Error loading screen: ' + error.message);
        }
    }

    loadScreenLayout(screen) {
        // Clear current components
        this.clearComponents();

        try {
            const components = JSON.parse(screen.layoutJson);
            this.components = components;
            this.currentScreenId = screen.id;

            // Update current screen name display
            this.updateCurrentScreenName(screen.name);

            // Render all components
            components.forEach(component => {
                this.renderComponent(component);
            });

            alert(`Screen "${screen.name}" loaded successfully!`);
        } catch (error) {
            alert('Error parsing screen layout: ' + error.message);
        }
    }

    clearComponents() {
        const mobileScreen = document.getElementById('screenArea');
        mobileScreen.innerHTML = '';
        this.components = [];
        this.selectedComponent = null;
        this.deselectComponent();

        // Reset current screen name if no screen is loaded
        if (!this.currentScreenId) {
            this.updateCurrentScreenName('New Screen');
        }
    }

    loadExistingScreen() {
        if (window.currentScreenData && window.currentScreenData.id) {
            // Only load if we have a real screen with an ID
            this.loadScreenLayout(window.currentScreenData);
        }
    }

    showNewScreenModal() {
        document.getElementById('newScreenModal').style.display = 'block';
    }

    closeNewScreenModal() {
        document.getElementById('newScreenModal').style.display = 'none';
        document.getElementById('newScreenForm').reset();
    }

    async createNewScreen() {
        const screenName = document.getElementById('screenName').value;

        if (!screenName.trim()) {
            alert('Please enter a screen name.');
            return;
        }

        // Clear current components and create new screen
        this.clearComponents();
        this.currentScreenId = null;
        this.closeNewScreenModal();

        // Update current screen name display
        this.updateCurrentScreenName(screenName);

        // Add a default component to start with
        this.addComponent('button', 50, 50);

        alert('New screen created! Add components and save when ready.');
    }

    async deleteScreen(screenId) {
        if (!confirm('Are you sure you want to delete this screen?')) {
            return;
        }

        try {
            const response = await fetch(`/api/screens/${screenId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Screen deleted successfully!');
                // Update screen list instead of reloading
                this.loadScreenList();
            } else {
                const error = await response.text();
                alert('Error deleting screen: ' + error.message);
            }
        } catch (error) {
            alert('Error deleting screen: ' + error.message);
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
}

// Initialize the designer when the page loads
document.addEventListener('DOMContentLoaded', function () {
    new ScreenDesigner();
});

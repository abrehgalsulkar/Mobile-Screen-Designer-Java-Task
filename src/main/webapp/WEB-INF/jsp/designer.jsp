<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mobile Screen Designer - ${application.name}</title>
            <link rel="stylesheet" href="/css/style.css?v=3">
            <link rel="stylesheet" href="/css/designer.css?v=3">
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.9.2/parsley.min.js"></script>
        </head>

        <body>
            <header>
                <div class="header-content">
                    <div class="header-left">
                        <div class="app-header-info">
                            <c:if test="${not empty application.iconPath}">
                                <img src="${application.iconPath}" alt="${application.name}" class="header-app-icon">
                            </c:if>
                            <div class="app-title-section">
                                <h1>Mobile Screen Designer</h1>
                                <p class="app-name">${application.name}</p>
                                <div class="current-screen-info">
                                    <span class="label">Current Screen:</span>
                                    <span id="currentScreenName" class="screen-name">New Screen</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <span class="user-info">Welcome, ${sessionScope.username}!</span>
                        <button id="saveScreenBtn" class="btn btn-primary">Save Screen</button>
                        <a href="/" class="btn btn-secondary">Back to Home</a>
                        <a href="/logout" class="btn btn-secondary">Logout</a>
                    </div>
                </div>
            </header>

            <main class="designer-container">
                <!-- Component Toolbox -->
                <div class="toolbox">
                    <h3>Components</h3>
                    <div class="component-list">
                        <div class="component-item" draggable="true" data-type="button">
                            <span class="component-icon">🔘</span>
                            <span>Button</span>
                        </div>
                        <div class="component-item" draggable="true" data-type="textbox">
                            <span class="component-icon">📝</span>
                            <span>Textbox</span>
                        </div>
                        <div class="component-item" draggable="true" data-type="textarea">
                            <span class="component-icon">📄</span>
                            <span>Text Area</span>
                        </div>
                        <div class="component-item" draggable="true" data-type="checkbox">
                            <span class="component-icon">☑️</span>
                            <span>Checkbox</span>
                        </div>
                        <div class="component-item" draggable="true" data-type="radio">
                            <span class="component-icon">🔘</span>
                            <span>Radio</span>
                        </div>
                        <div class="component-item" draggable="true" data-type="image">
                            <span class="component-icon">🖼️</span>
                            <span>Image</span>
                        </div>
                    </div>
                </div>

                <div class="mobile-frame-container">
                    <div class="mobile-device">
                        <div class="device-header">
                            <div class="device-notch"></div>
                        </div>
                        <div class="screen-area" id="screenArea">
                        </div>
                        <div class="resize-handle" id="resizeHandle">
                            <div class="resize-indicator">
                                <span>↕</span>
                                <span>Drag to resize height</span>
                            </div>
                        </div>
                        <div class="device-footer">
                            <div class="home-indicator"></div>
                        </div>
                    </div>
                </div>

                <!-- Property Editor -->
                <div class="property-editor">
                    <h3>Properties</h3>

                    <div class="screen-background-section" id="screenBackgroundSection" style="display: none;">
                        <h4>Screen Background</h4>
                        <div class="background-options">
                            <div class="background-color-option">
                                <label>Background Color:</label>
                                <input type="color" id="screenBackgroundColor" value="#ffffff">
                            </div>
                            <div class="background-image-option">
                                <label>Background Image:</label>
                                <input type="file" id="screenBackgroundImage" accept="image/*">
                                <div class="background-preview" id="backgroundPreview">
                                    <span>No image selected</span>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn btn-secondary btn-small" id="clearBackgroundImageBtn">Clear Image</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="propertyForm" class="property-form" style="display: none;">
                        <div class="form-group">
                            <label for="componentType">Type:</label>
                            <input type="text" id="componentType" readonly>
                        </div>
                        <div class="form-group">
                            <label for="componentX">X Position:</label>
                            <input type="number" id="componentX" min="0" max="375">
                        </div>
                        <div class="form-group">
                            <label for="componentY">Y Position:</label>
                            <input type="number" id="componentY" min="0" max="667">
                        </div>
                        <div class="form-group">
                            <label for="componentWidth">Width:</label>
                            <input type="number" id="componentWidth" min="20" max="375">
                        </div>
                        <div class="form-group">
                            <label for="componentHeight">Height:</label>
                            <input type="number" id="componentHeight" min="20" max="667">
                        </div>
                        
                        <div class="form-group">
                            <label for="componentTextColor">Text Color:</label>
                            <input type="color" id="componentTextColor" value="#000000">
                        </div>
                        <div class="form-group checkbox-group" style="display: none;">
                            <label>
                                <input type="checkbox" id="componentChecked">
                                Checked
                            </label>
                        </div>
                        <div class="form-group image-group" style="display: none;">
                            <label for="componentImage">Image:</label>
                            <input type="file" id="componentImage" accept="image/*">
                        </div>
                        <div class="form-group">
                            <button type="button" id="bringFrontBtn" class="btn btn-small">Bring Front</button>
                            <button type="button" id="sendBackBtn" class="btn btn-small">Send Back</button>
                        </div>
                        <div class="form-group">
                            <button type="button" id="deleteComponentBtn"
                                class="btn btn-danger btn-small">Delete</button>
                        </div>
                    </div>
                    <div id="noSelection" class="no-selection">
                        <p>Select a component to edit properties</p>
                    </div>
                </div>
            </main>

            <!-- Screen List Sidebar -->
            <aside class="screen-list-sidebar">
                <h3>Screens</h3>
                <div class="screen-actions">
                    <button id="newScreenBtn" class="btn btn-primary btn-small">New Screen</button>
                </div>
                <div class="screen-list" id="screenList">
                </div>
            </aside>

            <!-- New Screen Modal -->
            <div id="newScreenModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <h3>Create New Screen</h3>
                    <form id="newScreenForm" data-parsley-validate>
                        <div class="form-group">
                            <label for="screenName">Screen Name:</label>
                            <input type="text" id="screenName" required data-parsley-required="true" data-parsley-minlength="2" data-parsley-trigger="blur" placeholder="Enter a screen name">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Create</button>
                            <button type="button" class="btn btn-secondary" id="cancelScreenBtn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <script>
                window.applicationData = {
                    id: '${application.id}',
                    name: '${application.name}'
                };

                <c:if test="${not empty screen and screen.id != null}">
                    window.currentScreenData = {
                        id: '${screen.id}',
                        name: '${screen.name}',
                        layoutJson: '${screen.layoutJson}'
                    };
                </c:if>
                <c:if test="${empty screen or screen.id == null}">
                    window.currentScreenData = {
                        id: null,
                        name: 'New Screen',
                        layoutJson: '[]'
                    };
                </c:if>
            </script>
            <script src="/js/designer.js?v=3"></script>
        </body>

        </html>

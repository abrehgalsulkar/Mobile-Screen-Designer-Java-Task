<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mobile Screen Designer - Home</title>
            <link rel="stylesheet" href="/css/style.css">
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </head>

        <body>
            <div class="container">
                <header class="header">
                    <div class="header-left">
                        <h1>Mobile Screen Designer</h1>
                        <p>Create and manage your mobile application screens</p>

                    </div>
                    <div class="header-right">
                        <span class="user-info">Welcome, <span id="currentUsername"></span>!</span>
                        <button id="logoutBtn" class="btn btn-secondary">Logout</button>
                    </div>
                </header>

                <div class="actions">
                    <button id="createAppBtn" class="btn btn-primary">Create New Application</button>
                </div>

                <div class="applications-grid">
                    <c:forEach var="app" items="${applications}">
                        <div class="app-card" data-app-id="${app.id}">
                            <div class="app-icon">
                                <c:if test="${not empty app.iconPath}">
                                    <img src="${app.iconPath}" alt="App Icon">
                                </c:if>
                                <c:if test="${empty app.iconPath}">
                                    <div class="default-icon">📱</div>
                                </c:if>
                            </div>
                            <div class="app-info">
                                <h3>${app.name}</h3>
                                <p>Created: ${app.createdAt}</p>
                            </div>
                            <div class="app-actions">
                                <button class="btn btn-secondary open-app" data-app-id="${app.id}">Open</button>
                                <button class="btn btn-info edit-app" data-app-id="${app.id}">Edit</button>
                                <button class="btn btn-danger delete-app" data-app-id="${app.id}">Delete</button>
                            </div>
                        </div>
                    </c:forEach>
                </div>

                <c:if test="${empty applications}">
                    <div class="empty-state">
                        <h2>No Applications Yet</h2>
                        <p>Create your first application to get started!</p>
                    </div>
                </c:if>
            </div>

            <div id="createAppModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Create New Application</h2>
                    <form id="createAppForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="appName">Application Name:</label>
                            <input type="text" id="appName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="appIcon">Application Icon:</label>
                            <input type="file" id="appIcon" name="icon" accept=".png,.jpg,.jpeg,.gif">
                            <small>Upload an icon image (PNG, JPG, GIF only)</small>
                            <div id="iconPreview" class="icon-preview" style="display: none;">
                                <img id="iconPreviewImg" src="" alt="Icon Preview"
                                    style="max-width: 100px; max-height: 100px; margin-top: 10px;">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Create</button>
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Edit Application Modal -->
            <div id="editAppModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Edit Application</h2>
                    <form id="editAppForm" enctype="multipart/form-data">
                        <input type="hidden" id="editAppId" name="id">
                        <div class="form-group">
                            <label for="editAppName">Application Name:</label>
                            <input type="text" id="editAppName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="editAppIcon">Application Icon:</label>
                            <input type="file" id="editAppIcon" name="icon" accept=".png,.jpg,.jpeg,.gif">
                            <small>Upload a new icon image (PNG, JPG, GIF only)</small>
                            <div id="currentIconPreview" class="current-icon-preview"></div>
                            <div id="editIconPreview" class="icon-preview" style="display: none;">
                                <img id="editIconPreviewImg" src="" alt="Icon Preview"
                                    style="max-width: 100px; max-height: 100px; margin-top: 10px;">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Update</button>
                            <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <script src="/js/home.js"></script>

            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    document.getElementById('currentUsername').textContent = 'User';
                    document.getElementById('logoutBtn').addEventListener('click', function () {
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
                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = '/logout';
                                document.body.appendChild(form);
                                form.submit();
                            }
                        });
                    });
                });
            </script>
        </body>

        </html>
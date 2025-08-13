<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mobile Screen Designer - Home</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>

        <body>
            <div class="container">
                <header class="header">
                    <h1>Mobile Screen Designer</h1>
                    <p>Create and manage your mobile application screens</p>
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

            <!-- Create Application Modal -->
            <div id="createAppModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Create New Application</h2>
                    <form id="createAppForm">
                        <div class="form-group">
                            <label for="appName">Application Name:</label>
                            <input type="text" id="appName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="appIcon">Icon Path (optional):</label>
                            <input type="text" id="appIcon" name="iconPath" placeholder="/path/to/icon.png">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Create</button>
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <script src="/js/home.js"></script>
        </body>

        </html>
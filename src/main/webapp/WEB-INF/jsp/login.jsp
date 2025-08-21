<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login - Mobile Screen Designer</title>
            <link rel="stylesheet" href="/css/style.css">
            <style>
                .auth-container {
                    max-width: 400px;
                    margin: 100px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .auth-header h1 {
                    color: #333;
                    margin-bottom: 10px;
                }

                .auth-form .form-group {
                    margin-bottom: 20px;
                }

                .auth-form input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                }

                .auth-form input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                }

                .auth-form .btn {
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                    margin-bottom: 15px;
                }

                .auth-links {
                    text-align: center;
                    margin-top: 20px;
                }

                .auth-links a {
                    color: #007bff;
                    text-decoration: none;
                }

                .auth-links a:hover {
                    text-decoration: underline;
                }

                .alert {
                    padding: 12px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }

                .alert-error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .alert-success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
            </style>
        </head>

        <body>
            <div class="auth-container">
                <div class="auth-header">
                    <h1>Mobile Screen Designer</h1>
                    <p>Please login to continue</p>
                </div>

                <c:if test="${not empty error}">
                    <div class="alert alert-error">${error}</div>
                </c:if>

                <c:if test="${not empty message}">
                    <div class="alert alert-success">${message}</div>
                </c:if>

                <form class="auth-form" action="/login" method="post">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>

                    <button type="submit" class="btn btn-primary">Login</button>
                </form>

                <div class="auth-links">
                    <p>Don't have an account?</p>
                    <a href="/register" class="btn btn-secondary"
                        style="display: inline-block; margin-top: 10px;">Create Account</a>
                </div>
            </div>
        </body>

        </html>
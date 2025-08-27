<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Register - Mobile Screen Designer</title>
            <link rel="stylesheet" href="/css/style.css">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/parsley.js/2.9.2/parsley.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
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

                .requirements {
                    font-size: 12px;
                    color: #666;
                    margin-top: 5px;
                }
            </style>
        </head>

        <body>
            <div class="auth-container">
                <div class="auth-header">
                    <h1>Mobile Screen Designer</h1>
                    <p>Create your account</p>
                </div>

                <c:if test="${not empty error}">
                    <div class="alert alert-error">${error}</div>
                </c:if>

                <form class="auth-form" action="/register" method="post" id="registerForm">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required data-parsley-required="true"
                            data-parsley-minlength="3" data-parsley-trigger="blur">
                        <div class="requirements">Minimum 3 characters</div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required data-parsley-required="true"
                            data-parsley-type="email" data-parsley-trigger="blur">
                    </div>

                    <div class="form-group">
                        <label for="contactNumber">Contact Number:</label>
                        <input type="tel" id="contactNumber" name="contactNumber"
                            data-parsley-pattern="^[+]?[0-9\s\-\(\)]{10,20}$" data-parsley-trigger="blur">
                        <div class="requirements">Optional: +1 (555) 123-4567 format</div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required data-parsley-required="true"
                            data-parsley-minlength="6" data-parsley-trigger="blur">
                        <div class="requirements">Minimum 6 characters</div>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required
                            data-parsley-required="true" data-parsley-equalto="#password" data-parsley-trigger="blur">
                    </div>

                    <button type="submit" class="btn btn-primary">Register</button>
                </form>

                <div class="auth-links">
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </div>
            </div>

            <script>
                $(document).ready(function () {
                    $('#registerForm').parsley();
                });
                var errorMessage = '${error}';
                if (errorMessage && errorMessage.trim() !== '') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Registration Failed',
                        text: errorMessage,
                        confirmButtonColor: '#007bff'
                    });
                }
            </script>
        </body>

        </html>
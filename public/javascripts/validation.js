$(document).ready(function() {
    // Show Password functionality for both registration and login forms
    $('#show-password').on('change', function() {
        const passwordField = $('#password');
        const type = $(this).is(':checked') ? 'text' : 'password';
        passwordField.attr('type', type);
    });
    // Enable validation upon form submission (optional)
    $('#registration-form').submit(function(event) {
      if (!validateEmail() || !validatePassword()) {
        event.preventDefault(); // Prevent form submission if validation fails
      }
    });
  
    // Email validation
    $('#email').on('input', function () {
        const email = $(this).val();
        console.log('Email input changed:', email); // Log email input changes
        validateEmail(email);
    });

    function validateEmail(email = '') {
        console.log('Checking email:', email); // Log email being checked
        if (email === '') {
            $('#email').css('background-color', 'white'); // Set background color to white
            $('#email-error').text('').css('color', '');
            $('#register-button').prop('disabled', false); // Enable register button
            return true;
        }
        // Check email availability using AJAX
        $.ajax({
            url: '/checkEmail',
            data: { email },
            success: function (data) {
                console.log('AJAX success response:', data); // Log AJAX success response
                if (data.exists) {
                    $('#email').css('background-color', '#ffc0b8');
                    $('#email-error').text('Email already registered!').css('color', 'red');
                    $('#register-button').prop('disabled', true); // Disable register button
                } else {
                    $('#email').css('background-color', '#d7ffb8');
                    $('#email-error').text('Email is available!').css('color', 'green');
                    $('#register-button').prop('disabled', false); // Enable register button
                }
            },
            error: function (xhr, status, error) {
                console.error('Error checking email availability:', error, 'Status:', status, 'XHR:', xhr); // Log AJAX error
                $('#email-error').text('Error checking email.').css('color', 'red');
            }
        });
        return true; // Indicate validation success
    }

  
    
    // Password validation
    $('#password').on('input', function() {
      const password = $(this).val();
      validatePassword(password);
    });



    // Password validation
    $('#password').on('input', function () {
        const password = $(this).val();
        validatePassword(password);
    });
    function validatePassword(password = '') {
        if (password === '') {
            $('#password').css('background-color', 'white'); // Set background color to white
            $('#password-error').text('').css('color', '');
            $('#register-button').prop('disabled', false); // Enable register button
            return true;
        }
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])/; // Assuming this criteria
        if (password.length < 8 || !passwordRegex.test(password)) {
            $('#password').css('background-color', '#ffc0b8');
            $('#password-error').text('Password must be at least 8 characters and include a digit, lowercase, uppercase, and special character.').css('color', 'red');
            $('#register-button').prop('disabled', true); // Disable register button
        } else {
            $('#password').css('background-color', '#d7ffb8');
            $('#password-error').text('').css('color', ''); // Clear error message
            $('#register-button').prop('disabled', false); // Disable register button
        }
    }

    $('#reset-button').on('click', function () {
        $('#register-form')[0].reset();
        $('#email').css('background-color', 'white'); // Set background color to white
        $('#email-error').text('').css('color', '');
        $('#password').css('background-color', 'white'); // Set background color to white
        $('#password-error').text('').css('color', '');
        $('#register-button').prop('disabled', false); // Enable register button
        return true;
    });
  });
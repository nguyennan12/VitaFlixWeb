document.addEventListener('DOMContentLoaded', function () {
    const loginFormContainer = document.querySelector('.login-form-container');
    const registerFormContainer = document.querySelector('.register-form-container');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');


    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function (e) {
            e.preventDefault();
            loginFormContainer.classList.add('d-none');
            registerFormContainer.classList.remove('d-none');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', function (e) {
            e.preventDefault();
            registerFormContainer.classList.add('d-none');
            loginFormContainer.classList.remove('d-none');
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const loginFormContainer = document.querySelector('.login-form-container');
    const registerFormContainer = document.querySelector('.register-form-container');
    
    const mainBtnLogin = document.querySelector('.btn-login'); 
    const mainBtnRegister = document.querySelector('.btn-register');

    const closeLoginFormBtn = document.getElementById('close-login-form');
    const closeRegisterFormBtn = document.getElementById('close-register-form');

    const showRegisterLink = document.getElementById('show-register'); 
    const showLoginLink = document.getElementById('show-login');

    loginFormContainer.classList.add('d-none');
    registerFormContainer.classList.add('d-none');
    
    function showForm(formToShow, formToHide) {
        if (formToHide) {
            formToHide.classList.add('d-none');
        }
        // Hiện form được chọn
        formToShow.classList.remove('d-none');
    }

    if (mainBtnLogin) {
        mainBtnLogin.addEventListener('click', function() {
            showForm(loginFormContainer, registerFormContainer);
        });
    }

    if (mainBtnRegister) {
        mainBtnRegister.addEventListener('click', function() {
            showForm(registerFormContainer, loginFormContainer);
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForm(registerFormContainer, loginFormContainer);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForm(loginFormContainer, registerFormContainer);
        });
    }
    

    if (closeLoginFormBtn) {
        closeLoginFormBtn.addEventListener('click', function() {
            loginFormContainer.classList.add('d-none');
        });
    }
    
    // 6. Click nút X trong form Đăng ký
    if (closeRegisterFormBtn) {
        closeRegisterFormBtn.addEventListener('click', function() {
            registerFormContainer.classList.add('d-none');
        });
    }
});
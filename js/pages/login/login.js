document.addEventListener('DOMContentLoaded', function () {
    // Lấy các elements
    const loginFormContainer = document.querySelector('.login-form-container');
    const registerFormContainer = document.querySelector('.register-form-container');
    const mainBtnLogin = document.querySelector('.btn-login');
    const mainBtnRegister = document.querySelector('.btn-register');
    const closeLoginFormBtn = document.getElementById('close-login-form');
    const closeRegisterFormBtn = document.getElementById('close-register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const USERS_KEY = 'vitaflix_users';
    const CURRENT_USER_KEY = 'vitaflix_current_user';

    if (loginFormContainer) loginFormContainer.classList.add('d-none');
    if (registerFormContainer) registerFormContainer.classList.add('d-none');

    function showForm(formToShow, formToHide) {
        if (formToHide) {
            formToHide.classList.add('d-none');
        }
        if (formToShow) {
            formToShow.classList.remove('d-none');
        }
    }

    if (mainBtnLogin) {
        mainBtnLogin.addEventListener('click', function () {
            showForm(loginFormContainer, registerFormContainer);
        });
    }

    if (mainBtnRegister) {
        mainBtnRegister.addEventListener('click', function () {
            showForm(registerFormContainer, loginFormContainer);
        });
    }

    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function (e) {
            e.preventDefault();
            showForm(registerFormContainer, loginFormContainer);
        });
    }

    // Link chuyển sang form đăng nhập
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function (e) {
            e.preventDefault();
            showForm(loginFormContainer, registerFormContainer);
        });
    }

    if (closeLoginFormBtn) {
        closeLoginFormBtn.addEventListener('click', function () {
            loginFormContainer.classList.add('d-none');
        });
    }

    if (closeRegisterFormBtn) {
        closeRegisterFormBtn.addEventListener('click', function () {
            registerFormContainer.classList.add('d-none');
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const lastName = document.getElementById('lastName').value.trim();
            const firstName = document.getElementById('firstName').value.trim();
            const username = document.getElementById('usernameInput').value.trim();
            const email = document.getElementById('regEmailInput').value.trim();
            const password = document.getElementById('regPasswordInput').value;
            const confirmPassword = document.getElementById('confirmPasswordInput').value;

            if (!lastName || !firstName || !username || !email || !password || !confirmPassword) {
                alert('Vui lòng điền đầy đủ thông tin đăng ký!');
                return;
            }

            if (password !== confirmPassword) {
                alert('Mật khẩu và xác nhận mật khẩu không khớp!');
                return;
            }

            // Lấy danh sách users
            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
            
            // Kiểm tra trùng lặp
            const usernameExists = users.some(u => u.username === username);
            const emailExists = users.some(u => u.email === email);

            if (usernameExists) {
                alert('Tên người dùng đã tồn tại!');
                return;
            }
            if (emailExists) {
                alert('Email này đã được sử dụng!');
                return;
            }

            // Tạo user mới
            const newUser = { 
                firstName, 
                lastName, 
                username, 
                email, 
                password,
                avatar: ''
            };
            
            users.push(newUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));

            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            
            // Reset form và chuyển sang form đăng nhập
            registerForm.reset();
            showForm(loginFormContainer, registerFormContainer);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const emailOrUsername = document.getElementById('emailInput').value.trim();
            const password = document.getElementById('passwordInput').value;

            if (!emailOrUsername || !password) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

            if (users.length === 0) {
                alert('Chưa có tài khoản nào! Vui lòng đăng ký trước.');
                showForm(registerFormContainer, loginFormContainer);
                return;
            }

            // Tìm user
            const user = users.find(u =>
                (u.username === emailOrUsername || u.email === emailOrUsername)
            );

            if (!user) {
                alert('Tài khoản không tồn tại! Vui lòng đăng ký.');
                showForm(registerFormContainer, loginFormContainer);
                return;
            }

            if (user.password !== password) {
                alert('Mật khẩu không đúng!');
                return;
            }

            // Đăng nhập thành công
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            
            window.dispatchEvent(new Event('storage'));

            alert('Đăng nhập thành công!');
            
            // Đóng form
            if (loginFormContainer) {
                loginFormContainer.classList.add('d-none');
            }

            // Chuyển hướng về trang chủ 
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
    }
});
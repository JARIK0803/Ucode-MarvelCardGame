function validateLogin(login) {
    if (login.length < 4) 
        return 'The login length must be at least 4 symbols';
    if (!/^[a-zA-Z]/.test(login))
        return 'The login must starts with a letter';
    if (!/^[a-zA-Z0-9]+$/.test(login)) 
        return 'The login must containt only a-z, A-Z, 0-9';
    if (login.length > 16) 
        return 'The login length must be shorter than 16 symbols';

    return '';
}

function validateNickname(nickname) {
    if (nickname.length < 4) 
        return 'The nickname length must be at least 4 symbols';
    if (!/^[a-zA-Z]/.test(nickname))
        return 'The nickname must starts with a letter';
    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) 
        return 'The nickname must containt only a-z, A-Z, 0-9, _, -';
    if (nickname.length > 16) 
        return 'The nickname length must be shorter than 16 symbols';

    return '';
}

function validatePassword(password, repassword) {
    if (password.length < 4) 
        return 'The password length must be at least 4 symbols';
    if (!/^[a-zA-Z0-9]+$/.test(password)) 
        return 'The password must containt only a-z, A-Z, 0-9';
    if (!/(?=.*\d)/.test(password))
        return 'The password should contain at least one digit';
    if (!/(?=.*[a-z])/.test(password)) 
        return 'The password should contain at least one lower case';
    if (!/(?=.*[A-Z])/.test(password))
        return 'The password should contain at least one upper case';
    if (password.length > 16) 
        return 'The password length must be shorter than 16 symbols';
    if (password !== repassword)
        return 'Passwords do not match';

    return '';
}

function validateData(userData) {
    let loginErrorMsg = validateLogin(userData.login);
    let nicknameErrorMsg = validateNickname(userData.nickname);
    let passwordErrorMsg = validatePassword(userData.password, userData.repassword);
    let res = {};
    res.type = 'success';
    res.text = '';

    if ((res.text = nicknameErrorMsg || loginErrorMsg || passwordErrorMsg)) {
        res.type = 'error';
        // return res;
    }

    return res;
}

function getData() {
    const form = document.querySelector("#form");

    let inputs = form.elements;
    let data = {};
    data.nickname = inputs["nickname"].value;
    data.login = inputs["login"].value;
    data.password = inputs["password"].value;
    data.repassword = inputs["repassword"].value;

    return data;
}

async function sendUserData(userData) {
    let res = await fetch("/register", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    let data = await res.json();

    return data;
}

function setStyleMsg (notify, type) {
    switch (type) {
        case 'error':
            notify.classList.remove('notify--success');
            notify.classList.add('notify--error');
            break;

        case 'success':
            notify.classList.remove('notify--error');
            notify.classList.add('notify--success');
            break;
    
        default:
            break;
    }
}

function showMsg(data) {
    let notify = document.querySelector('.notify');
    notify.textContent = data.text;
    setStyleMsg(notify, data.type);
}

async function register() {
    let data = getData();
    let result = validateData(data);

    if (result.type !== 'error')
        result = await sendUserData(data);
    
    showMsg(result);
}

window.addEventListener("load", () => {
    const form = document.querySelector("#form");

    form.addEventListener("submit", event => {
        event.preventDefault();
        register();
    });
});
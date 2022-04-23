function getData() {
    const form = document.querySelector("#form");

    let inputs = form.elements;
    let data = {};
    data.login = inputs["login"].value;
    data.password = inputs["password"].value;

    return data;
}

async function sendUserData(userData) {
    let res = await fetch("/login", {
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

async function login() {
    let data = getData();
    let res = await sendUserData(data);

    showMsg(res);

    if (res.hasOwnProperty('redirect')) {
        setTimeout(() => {
            window.location.href = res.redirect;
        }, 1000);
    }
}

window.addEventListener("load", () => {
    const form = document.querySelector("#form");

    form.addEventListener("submit", event => {
        event.preventDefault();
        login();
    });
});
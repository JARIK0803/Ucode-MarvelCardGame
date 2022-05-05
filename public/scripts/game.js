const socket = io();

var oppInfo = document.getElementById('oppInfo');
var turnInfo = document.getElementById('turnInfo');
var timeDiv = document.getElementById('time');
var msgInput = document.getElementById('msgInput');
var msgDiv = document.getElementById('msgDiv');
var sendBtn = document.getElementById('sendBtn');

var get = location.search;
var param = {};
if (get !== '') {
    var tmp = [];
    var tmp2 = [];

    tmp = get.substring(1).split('&');
    for (let i = 0; i < tmp.length; i++) {
        tmp2 = tmp[i].split('=');
        param[tmp2[0]] = tmp2[1];
    }
}

var timerId;

sendBtn.addEventListener('click', function() {
    var msg = msgInput.value;
    if (msg !== '') {
        msgInput.value = '';
        socket.emit('msg', {
            id: param.id,
            msg: msg
        });
        clearTimeout(timerId);
    }
});

socket.emit('getInfo', {id: param.id});

socket.on('startHand', (data) => {
    console.log(data);
})  

socket.on('getInfo', function(data) {
    // console.log(data);
    oppInfo.innerHTML = `
        <p>
            Your opponent: ${data.oppNickname}
        </p>`;
});

socket.on('msgFromServer', function(data) {
    msgDiv.innerHTML = msgDiv.innerHTML + `
        <p>
            <b>${data.author}:</b> --> ${data.msg}
        </p>
    `;
});

socket.on('message', function(data) {
    alert(data);
    if (data === 'Winner') {
        socket.emit('gameEnd', {id: param.id});
    }
    if (data === 'Winner' || data === 'Loser') {
        window.location.href = `/?id=${param.id}`;
    }
    
});

socket.on('turn', (card) => {
    console.log(card);
    msgInput.disabled = false;
    turnInfo.innerHTML = `
    <p>
        Your turn
    </p>`;

    let count = 29;
    timeDiv.innerHTML = `<p>30</p>`;
    timerId = setInterval(() => {
        timeDiv.innerHTML = `<p>${count}</p>`;
        if (count === 0) {
            socket.emit('turnEnd');
            clearTimeout(timerId);
        }
        count--;
    }, 1000);
});

socket.on('oppTurn', function() {
    msgInput.disabled = true;
    timeDiv.innerHTML = "";
    turnInfo.innerHTML = `
    <p>
        Your opponent's turn
    </p>`;
});

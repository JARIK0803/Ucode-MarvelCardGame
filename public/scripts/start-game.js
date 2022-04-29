const socket = io();

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

const startGameBtn = document.getElementById('startGameBtn');

if (startGameBtn) {
    startGameBtn.addEventListener('click', function () {
        socket.emit('startGame', {id: param.id});
    });
}

socket.on('waiting', function() {
    window.location.href = `/waiting?id=${param.id}`;
});

socket.on('startGame', function() {
    window.location.href = `/game?id=${param.id}`;
});

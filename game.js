class Game {
    constructor(p1, p2) {
        this.players = [p1, p2];
        // this.players = [p1.socket, p2.socket];
        this.turn = {};

        // var self = this;

        this.#setPlayersEvents();
        this.#startGame();
    }
    
    #setPlayersEvents() {
        this.players.forEach((player, idx) => {
            const opponent = this.players[(idx + 1) % 2];

            player.socket.on('msg', (data) => {
                this.onTurn(idx, data);
            });

            player.socket.on('moveCardToBoard', (cardIdx) => {
                player.moveCardToBoard(cardIdx);
                player.socket.emit('moveCardToBoard', player.board);
                opponent.socket.emit('oppMoveCardToBoard', player.board);
            });
            
            player.socket.on('turnEnd', () => {
                this.turns((idx + 1) % 2);
            });
        });
    }

    #startGame() {
        let goesFirstIdx = Math.round(Math.random());

        this.#getStartCards(goesFirstIdx);
        this.turns(goesFirstIdx);
    }

    #getStartCards(idx) {
        this.players[idx].getCardsToHand(3);
        this.players[(idx + 1) % 2].getCardsToHand(4);

        this.players.forEach((player, idx) => {
            player.socket.emit('startHand', player.hand);
        });
    }

    turns(playerIndex) {
        let data = this.players[playerIndex].startTurn();
        
        this.players[playerIndex].socket.emit('turn', data);
        this.players[(playerIndex + 1) % 2].socket.emit('oppTurn');
    }

    sendToPlayer(playerIndex, msg) {
        this.players[playerIndex].socket.emit('message', msg);
    }

    sendToPlayers(msg) {
        this.players.forEach(player => {
            player.socket.emit('message', msg);
        });
    }

    onTurn(playerIndex, data) {
        this.turn.msg = data.msg;
        this.turn.playerIndex = playerIndex;

        // var self = this;

        this.players.forEach((player, idx) => {
            player.socket.emit('msgFromServer', { 
                msg: data.msg,
                author: this.players[playerIndex].user.nickname 
            });
        });

        this.checkGameOver();

        this.turns((playerIndex + 1) % 2);
    }

    checkGameOver() {
        if (this.turn.msg === 'win') {
            let index = this.turn.playerIndex;
            this.sendWinMessage(this.players[index].socket, this.players[(index + 1) % 2].socket);
        }
    }

    sendWinMessage(winner, loser) {
        winner.emit('message', 'Winner');
        loser.emit('message', 'Loser');
    }
}

export default Game;

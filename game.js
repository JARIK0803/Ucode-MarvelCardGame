class Game {
    constructor(p1, p2) {
        this.playersInfo = [p1, p2];
        this.players = [p1.socket, p2.socket];
        this.turn = {};

        var self = this;

        this.#setPlayersEvents();
        this.#startGame();
    }

    #setPlayersEvents() {
        this.playersInfo.forEach((player, idx) => {
            const opponent = this.playersInfo[(idx + 1) % 2];

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

        // this.players.forEach((player, idx) => {
        //     const player1 = this.playersInfo[idx];
        //     const player2 = this.playersInfo[(idx + 1) % 2];

        //     player.on('msg', (data) => {
        //         this.onTurn(idx, data);
        //     });
            
        //     player.on('moveCardToBoard', (cardIdx) => {

        //         player1.moveCardToBoard(cardIdx);
        //         player.emit('moveCardToBoard', player1.board);
        //         this.players[(idx + 1) % 2].emit('oppMoveCardToBoard', player1.board);
        //     });
            
        //     player.on('turnEnd', () => {
        //         this.turns((idx + 1) % 2);
        //     });

        // });
    }

    // #startGame() {
    //     let goesFirstIdx = Math.round(Math.random());

    //     this.#whoGoesFirst();

    //     this.players.forEach((player, idx) => {
    //         player.emit('startHand', this.playersInfo[idx].hand);
    //     });
    // }

    #startGame() {
        let goesFirstIdx = Math.round(Math.random());

        this.#getStartCards(goesFirstIdx);
        this.turns(goesFirstIdx);
    }

    #getStartCards(idx) {
        this.playersInfo[idx].getCardsToHand(3);
        this.playersInfo[(idx + 1) % 2].getCardsToHand(4);

        this.players.forEach((player, idx) => {
            player.emit('startHand', this.playersInfo[idx].hand);
        });
    }

    // #whoGoesFirst() {
    //     let index = Math.round(Math.random());
    //     // let second = (index + 1) % 2;
    //     this.playersInfo[index].getCardsToHand(3);
    //     this.playersInfo[(index + 1) % 2].getCardsToHand(4);

    //     this.turns(index);
    // }

    turns(playerIndex) {
        let card = [];
        if (this.playersInfo[playerIndex].cardDeck.length)
            card = this.playersInfo[playerIndex].getCardsToHand(1);
        
        this.players[playerIndex].emit('turn', card);
        this.players[(playerIndex + 1) % 2].emit('oppTurn');

    }

    sendToPlayer(playerIndex, msg) {
        this.players[playerIndex].emit('message', msg);
    }

    sendToPlayers(msg) {
        this.players.forEach(player => {
            player.emit('message', msg);
        });
    }

    onTurn(playerIndex, data) {
        this.turn.msg = data.msg;
        this.turn.playerIndex = playerIndex;

        var self = this;

        this.players.forEach((player, idx) => {
            player.emit('msgFromServer', { 
                msg: data.msg,
                author: self.playersInfo[playerIndex].user.nickname 
            });
        });

        this.checkGameOver();

        this.turns((playerIndex + 1) % 2);
    }

    checkGameOver() {
        if (this.turn.msg === 'win') {
            let index = this.turn.playerIndex;
            this.sendWinMessage(this.players[index], this.players[(index + 1) % 2]);
        }
    }

    sendWinMessage(winner, loser) {
        winner.emit('message', 'Winner');
        loser.emit('message', 'Loser');
    }
}

export default Game;

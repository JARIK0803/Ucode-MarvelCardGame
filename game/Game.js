import db from "../models/index.js";

const Card = db.sequelize.models.card;

class Game {
    constructor(p1, p2) {
        this.players = [p1, p2];
        this.turn = {};

        this.#setPlayersEvents();
        this.#startGame();
    }
    
    #setPlayersEvents() {
        this.players.forEach((player, idx) => {
            const opponent = this.players[(idx + 1) % 2];

            player.socket.on('moveCardToBoard', (cardId) => {
                if (player.moveCardToBoard(cardId))
                    opponent.socket.emit('oppMoveCardToBoard', player.board[player.board.length - 1]);
                
                // player.socket.emit('moveCardToBoard', player.board); // replace player.board to some flag
            });

            player.socket.on('attackCard', (attackerId, targetId) => {
                let attacker = player.board.find(elem => elem.id === attackerId);
                let target = opponent.board.find(elem => elem.id === targetId);

                player.attackCardOnBoard(attackerId, target.attack_points);
                opponent.attackCardOnBoard(targetId, attacker.attack_points);

                player.socket.emit('attackCard', attacker, target);
                opponent.socket.emit('attackCard', target, attacker);

                console.log('player.board')
                console.log(player.board)
                console.log('opponent.board')
                console.log(opponent.board)
            });

            player.socket.on('clickCard', (cardId, isTarget, attackerId) => {
                opponent.socket.emit('clickCard', cardId, isTarget, attackerId);
            });
            
            player.socket.on('turnEnd', () => {
                this.turns((idx + 1) % 2);
            });

            player.socket.on('playerDeckSize', () => {
                let cardCount = player.cardDeck.length;
                player.socket.emit('playerDeckSize', cardCount);
            });

            player.socket.on('opponentDeckSize', () => {
                let cardCount = opponent.cardDeck.length;
                player.socket.emit('opponentDeckSize', cardCount);
            });
        });
    }

    #startGame() {
        let goesFirstIdx = Math.round(Math.random());

        this.#getStartCards(goesFirstIdx);

        this.players.forEach((player, idx) => {
            const opponent = this.players[(idx + 1) % 2];

            player.socket.emit('initPlayersData', JSON.stringify({
                "player": {nickname: player.nickname, hand: player.hand, avatar: player.avatar, health: player.hp, mana: player.currMana},
                "opponent": {nickname: opponent.nickname, handLength: opponent.hand.length, avatar: opponent.avatar, health: opponent.hp}
            }));
            
        });

        this.turns(goesFirstIdx);
    }

    #getStartCards(idx) {

        this.players[idx].getCardsToHand(3);
        this.players[(idx + 1) % 2].getCardsToHand(4);

    }

    turns(playerIndex) {
        const player =  this.players[playerIndex];
        const opponent = this.players[(playerIndex + 1) % 2];

        let data = player.startTurn();
        
        player.socket.emit('turn', data);
        opponent.socket.emit('oppTurn', data.newCard.length);
    }

    // sendToPlayer(playerIndex, msg) {
    //     this.players[playerIndex].socket.emit('message', msg);
    // }

    // sendToPlayers(msg) {
    //     this.players.forEach(player => {
    //         player.socket.emit('message', msg);
    //     });
    // }

    // onTurn(playerIndex, data) {
    //     this.turn.msg = data.msg;
    //     this.turn.playerIndex = playerIndex;

    //     // var self = this;

    //     this.players.forEach((player, idx) => {
    //         player.socket.emit('msgFromServer', { 
    //             msg: data.msg,
    //             author: this.players[playerIndex].nickname 
    //         });
    //     });

    //     this.checkGameOver();

    //     this.turns((playerIndex + 1) % 2);
    // }

    // checkGameOver() {
    //     if (this.turn.msg === 'win') {
    //         let index = this.turn.playerIndex;
    //         this.sendWinMessage(this.players[index].socket, this.players[(index + 1) % 2].socket);
    //     }
    // }

    // sendWinMessage(winner, loser) {
    //     winner.emit('message', 'Winner');
    //     loser.emit('message', 'Loser');
    // }
}

export default Game;

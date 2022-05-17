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
                if (player.moveCardToBoard(cardId)) {
                    // player.socket.emit('moveCardToBoard', cardId);
                    opponent.socket.emit('oppMoveCardToBoard', player.board[player.board.length - 1]);
                }
                
                // player.socket.emit('moveCardToBoard', player.board); // replace player.board to some flag
            });

            player.socket.on('attackCard', (attackerId, targetId) => {
                let attacker = player.board.find(elem => elem.id === attackerId);
                let target = opponent.board.find(elem => elem.id === targetId);

                player.attackCardOnBoard(attackerId, target.attack_points);
                opponent.attackCardOnBoard(targetId, attacker.attack_points);

                player.socket.emit('attackCard', attacker, target);
                opponent.socket.emit('attackCard', target, attacker);

                // console.log('player.board');
                // console.log(player.board);
                // console.log('opponent.board');
                // console.log(opponent.board);
            });

            player.socket.on('clickCard', (cardId, isTarget, attackerId) => {
                opponent.socket.emit('clickCard', cardId, isTarget, attackerId);
            });
            
            player.socket.on('turnEnd', () => {
                // this.turns((idx + 1) % 2);
                this.startTurn((idx + 1) % 2);
            });

            player.socket.on('playerDeckSize', () => {
                let cardCount = player.cardDeck.length;
                player.socket.emit('playerDeckSize', cardCount);
            });

            player.socket.on('opponentDeckSize', () => {
                let cardCount = opponent.cardDeck.length;
                player.socket.emit('opponentDeckSize', cardCount);
            });

            player.socket.on('giveUp', () => {
                this.gameOver(opponent, player);
            })
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

        // this.turns(goesFirstIdx);
        this.startTurn(goesFirstIdx);
    }

    getCardsToHand(playerIdx, numOfCards) {
        const player = this.players[playerIdx];
        const opponent = this.players[(playerIdx + 1) % 2];
        // let result = [];

        for (let i = 0; i < numOfCards; i++) {
            if (!player.cardDeck.length) {
                player.fatigue();
                player.socket.emit('updatePlayerHp', player.hp);
                opponent.socket.emit('updateOppHp', player.hp);
                this.checkGameOver();
                continue;
            }

            let card = player.drawCard();

            if (card) {
                player.socket.emit('updateCards', [card]);
                opponent.socket.emit('updateOppCards', [card].length);
                // result.push(card);
            }
        }

        // return result;
    }

    #getStartCards(goesFirstIdx) {
        const goesFirst = this.players[goesFirstIdx];
        const goesSecond = this.players[(goesFirstIdx + 1) % 2];
        
        for (let i = 0; i < 3; i++) {
            goesFirst.drawCard();
        }

        for (let i = 0; i < 4; i++) {
            goesSecond.drawCard();
        }
    }

    startTurn(playerIdx) {
        const player = this.players[playerIdx];
        const opponent = this.players[(playerIdx + 1) % 2];

        player.socket.emit('turn');
        opponent.socket.emit('oppTurn');
        
        this.getCardsToHand(playerIdx, 1);
        player.replenishMana();
    }

    // turns(playerIndex) {
    //     const player =  this.players[playerIndex];
    //     const opponent = this.players[(playerIndex + 1) % 2];

    //     let data = player.startTurn();
        
    //     player.socket.emit('turn', data);
    //     opponent.socket.emit('oppTurn', data.newCard.length);
    // }

    checkGameOver() {
        if (this.players[0].hp <= 0) {
            this.gameOver(this.players[1], this.players[0]);
        }

        if (this.players[1].hp <= 0) {
            this.gameOver(this.players[0], this.players[1]);
        }
    }

    gameOver(winner, loser) {
        winner.socket.emit('gameOver', 'Winner');
        loser.socket.emit('gameOver', 'Loser');
    }
}

export default Game;

import db from "./models/index.js";

const Card = db.sequelize.models.card;

class Game {
    constructor(p1, p2) {
        this.playersInfo = [p1, p2];
        this.players = [p1.socket, p2.socket];
        this.turn = {};

        var self = this;

        this.players.forEach((player, idx) => {
            player.on('msg', async function(data) {
                await self.onTurn(idx, data);
            });
            
            player.on('turnEnd', function() {
                self.turns((idx + 1) % 2);
            });
        });

        this.turns(Math.floor(Math.random() * 2)); 
    }

    sendToPlayer(playerIndex, msg) {
        this.players[playerIndex].emit('message', msg);
    }

    sendToPlayers(msg) {
        this.players.forEach(player => {
            player.emit('message', msg);
        });
    }

    turns(playerIndex) {
        this.players[playerIndex].emit('turn');
        this.players[(playerIndex + 1) % 2].emit('oppTurn');
    }

    async onTurn(playerIndex, data) {

        // let cardPlayed = await Card.findByPk(data.cardID, {
        //     attributes: {
        //         exclude: ["created_at", "updated_at"]
        //     }
        // });
        // console.dir(cardPlayed.dataValues);
        // this.turn.move = JSON.stringify(cardPlayed.dataValues);
        this.turn.msg = data.msg;
        this.turn.playerIndex = playerIndex;

        var self = this;

        this.players.forEach((player, idx) => {
            player.emit('msgFromServer', { 
                msg: data.msg,
                author: self.playersInfo[playerIndex].nickname 
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

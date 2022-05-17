import Card from "./Card.js";
import Board from "./Board.js";
import HiddenCard from "./HiddenCard.js";

class Game {

    static assetsDir = "assets";
    constructor(socket) {

        this.socket = socket;
        this.field = null;
        
        this.timerId = null;
        
        this.setGameEvents();
        this.setBtnEvents();
        this.init();

    }

    setGameEvents() {

        this.socket.on('initPlayersData', (playersData) => {
            playersData = JSON.parse(playersData);

            this.field = new Board({...playersData.player, socket: this.socket});

            this.displayPlayer(playersData.player, true);
            this.displayPlayer(playersData.opponent, false);
            this.renderDeckCardsFor("player");
            this.renderDeckCardsFor("opponent");

            this.updateCards(playersData.player.hand);
            this.updateOpponentCards(playersData.opponent.handLength);
        })

        this.socket.on('oppMoveCardToBoard', (oppCard) => {
            this.field.addOpponentCard(oppCard);
        });

        this.socket.on('attackCard', (target, attacker) => {

            let targetCard = this.field.findCardById(target.id, true);
            let attackerCard = this.field.findCardById(attacker.id, false);

            if (target.defense_points <= 0) {
                this.field.removeCard(targetCard, true);
            } else {
                targetCard.updateCardData(target);
            }
            
            if (attacker.defense_points <= 0) {
                this.field.removeCard(attackerCard, false);
            } else {
                attackerCard.updateCardData(attacker);
            }

        });

        this.socket.on('updateCards', (newCard) => {
            this.field.player.hand.push(newCard[0]);
            this.updateCards(newCard);
        });

        this.socket.on('updateOppCards', (numOfNewCards) => {
            this.updateOpponentCards(numOfNewCards);
        });

        this.socket.on('updatePlayerHp', (hp) => {
            console.log('palyerHP: ' + hp); //edit
        });

        this.socket.on('updateOppHp', (oppHp) => {
            console.log('opponentHP: ' + oppHp); //edit
        });
        
        this.socket.on('replenishMana', (mana) => {
            this.field.player.mana = mana;
            this.field.updateMana(true);
        });

        this.socket.on('warning', (msg) => {
            console.log(msg); //edit
        });

        this.socket.on('turn', () => {
            this.setPlayerTurn();
        });

        this.socket.on('oppTurn', () => {
            this.setOppTurn();
        });

        this.socket.on('gameOver', (data) => {
            alert(data); //edit

            if (data === 'Winner') {
                socket.emit('gameOver', {id: this.field.player.userID});
            }
            // if (data === 'Winner' || data === 'Loser') {
                // window.location.href = `/?id=${this.field.player.userID}`;
            // }
            
        });
    }

    setPlayerTurn() {

        this.field.player.turn = true;
        const btn = document.querySelector(".turn-submit-btn");
        btn.disabled = false;
        let count = 10;
        const timerText = document.querySelector(".turn-time > .turn-timer");
        this.timerId = setInterval(() => {
            let countText = count < 10 ? `0${count}` : `${count}`;
            if (count <= 0) {
                clearTimeout(this.timerId);
                this.socket.emit('turnEnd');
            }
            timerText.textContent = `00:${countText}`;
            count--;
        }, 1000);
        this.field.clearChosenCards();        

    }

    setOppTurn() {

        this.field.player.turn = false;
        const timerText = document.querySelector(".turn-time > .turn-timer");
        timerText.textContent = `Opponent's turn`;
        clearTimeout(this.timerId);
        const btn = document.querySelector(".turn-submit-btn");
        btn.disabled = true;
        this.field.clearChosenCards();

    }

    setBtnEvents() {

        const turnBtn = document.querySelector(".turn-submit-btn");
        turnBtn.addEventListener("click", () => {
            this.socket.emit("turnEnd");
        });

        const giveupBtn = document.querySelector(".giveup-btn");
        giveupBtn.addEventListener("click", () => this.socket.emit("giveUp")); // 'give up' event here

    }

    updateCards(cards) {

        cards.forEach(card => new Card(card, this.field, false)
            .render(".player-container .card-container"));
        
    }
    
    updateOpponentCards(cardCount) {
        
        for (let i = 0; i < cardCount; ++i) {
            new HiddenCard(
                "enemy-card",
                ".opponent-container .card-container"
            );
        }

    }

    renderDeckCardsFor(playerClass) {
        
        let cardClass = `${playerClass}-deck-card`;
        let card = new HiddenCard(
            cardClass,
            `.turn-container .${playerClass}-deck`
        );
        card.setDeckCardEvent(this.socket, `${playerClass}DeckSize`);

    }

    displayPlayer(player, isCurrent) {

        let containClass = isCurrent ? ".player" : ".opponent";
        const container = document.querySelector(`${containClass}-container .inner`);
        const template = document.getElementById("player-template");

        let playerClone = template.content.firstElementChild.cloneNode(true);
        playerClone.setAttribute("id", `player-${player.id}`);
        container.appendChild(playerClone);

        let health = document.querySelector(`#player-${player.id} .player-health`);
        health.textContent = player.health;

        let nickname = document.querySelector(`#player-${player.id} .player-nickname`);
        nickname.textContent = player.nickname;

        let img = document.querySelector(`#player-${player.id} .player-avatar > img`);
        img.src = `data:image/jpeg;base64,${player.avatar}`;

    }

    init() {

        const url = new URL(window.location.href);
        const playerId = url.searchParams.get('id');
        this.socket.emit('initGame', {id: playerId});

    }

}

export default Game;

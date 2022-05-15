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
            this.updateOpponentCards(playersData.opponent.hand);
        })

        this.socket.on('oppMoveCardToBoard', (oppCard) => {
            this.field.addOpponentCard(oppCard);
        });

        this.socket.on('attackCard', (palyerCard, opponentCard) => {
            console.log('palyerCard');
            console.log(palyerCard);
            console.log('opponentCard');
            console.log(opponentCard);
        });

        this.socket.on('turn', (data) => {
            this.setPlayerTurn();
            
            this.field.player.hand.push(data.newCard);
            this.updateCards(data.newCard);
            this.field.player.mana = data.currMana;
            this.field.updateMana();

        });

        this.socket.on('oppTurn', (oppHand) => {
            this.setOppTurn();
            this.updateOpponentCards(oppHand);
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

    }

    setOppTurn() {

        this.field.player.turn = false;
        const timerText = document.querySelector(".turn-time > .turn-timer");
        timerText.textContent = `Opponent's turn`;
        clearTimeout(this.timerId);
        const btn = document.querySelector(".turn-submit-btn");
        btn.disabled = true;

    }

    setBtnEvents() {

        const turnBtn = document.querySelector(".turn-submit-btn");
        turnBtn.addEventListener("click", () => {
            this.socket.emit("turnEnd");
        });

        // const giveupBtn = document.querySelector(".giveup-btn");
        // giveupBtn.addEventListener("click", this.socket.emit("")); // 'give up' event here

    }

    updateCards(cards) {

        cards.forEach(card => new Card(card, this.field)
            .render(".player-container .card-container"));
        
    }
    
    updateOpponentCards(cards) {
        
        cards.forEach(card => new HiddenCard(
            "enemy-card",
            ".opponent-container .card-container"
        ));

    }

    renderDeckCardsFor(playerClass) {
        
        let cardClass = `${playerClass}-deck-card`;
        let card = new HiddenCard(
            cardClass,
            `.turn-container .${playerClass}-deck`
        );
        if (playerClass === "player") {
            card.addDeckCardText();
        }

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

import Card from "./Card.js";
import Field from "./Field.js";
import HiddenCard from "./HiddenCard.js";

class Game {

    static assetsDir = "assets";
    constructor(socket) {

        this.socket = socket;

        this.field = null;
        
        // preferably save players' data to this instance

        // this.initLoader();
        this.setGameEvents();
        this.init();
    }

    setGameEvents() {

        this.socket.on('initPlayersData', (playersData) => {
            playersData = JSON.parse(playersData);

            this.field = new Field({...playersData.player, socket: this.socket});

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
            this.field.player.hand.push(data.newCard);
            this.updateCards(data.newCard);
            this.field.player.mana = data.currMana;
            this.field.updateManaBy();

            let count = 10;
            let timerId = setInterval(() => {
                if (count === 0) {
                    this.socket.emit('turnEnd');
                    clearTimeout(timerId);
                }
                count--;
            }, 1000);
        });

        this.socket.on('oppTurn', (oppHand) => {
            this.updateOpponentCards(oppHand);
        });

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
        img.setAttribute("src", `${Game.assetsDir}/${player.avatar}`);

    }

    initLoader() {

        const body = document.querySelector(".game-container")
        body.style.display = "none";
        const loader = document.querySelector(".loader-container");
        loader.style.visibility = "visible";
        document.onreadystatechange = () => {
            if (document.readyState === "complete") {
                loader.style.display = "none";
                loader.style.animation = "none";
                body.style.display = "block";
                this.init();
            }
        };

    }

    init() {

        const url = new URL(window.location.href);
        const playerId = url.searchParams.get('id');
        this.socket.emit('initGame', {id: playerId});

    }

}

export default Game;

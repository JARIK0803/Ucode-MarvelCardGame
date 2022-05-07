import Card from "./Card.js";
import Field from "./Field.js";
import HiddenCard from "./HiddenCard.js";

class Game {

    static assetsDir = "assets";
    constructor() {

        this.field = null;
        
        // preferably save players' data to this instance

        // this.initLoader();
        this.init();
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

        let player = { id: 1, nickname: "pbalazhy", avatar: "player.png", health: 50, mana: 5 };
        let opponent = { id: 2, nickname: "michael", avatar: "opponent.png", health: 45 };

        this.field = new Field(player);
        
        let cards = [
            {
                defense_points: 80,
                attack_points: 100,
                cost: 1,
                alias: "Rocket",
                imgName: "rocket.jpg",
            },
            {
                defense_points: 120,
                attack_points: 130,
                cost: 3,
                alias: "Venom",
                imgName: "venom.png",
            },
            {
                defense_points: 100,
                attack_points: 150,
                cost: 5,
                alias: "Wonder Woman",
                imgName: "wonderwoman.png",
            },
            {
                defense_points: 80,
                attack_points: 100,
                cost: 1,
                alias: "Rocket",
                imgName: "rocket.jpg",
            },
            {
                defense_points: 120,
                attack_points: 130,
                cost: 3,
                alias: "Venom",
                imgName: "venom.png",
            },
            {
                defense_points: 100,
                attack_points: 150,
                cost: 5,
                alias: "Wonder Woman",
                imgName: "wonderwoman.png",
            },
        ];
        let opponentCards = [
            {
                defense_points: 100,
                attack_points: 150,
                cost: 50,
                alias: "Rocket",
                imgName: "rocket.jpg",
            },
            {
                defense_points: 100,
                attack_points: 150,
                cost: 50,
                alias: "Rocket",
                imgName: "rocket.jpg",
            },
            {
                defense_points: 100,
                attack_points: 150,
                cost: 50,
                alias: "Rocket",
                imgName: "rocket.jpg",
            },
            {
                defense_points: 80,
                attack_points: 100,
                cost: 1,
                alias: "Rocket",
                imgName: "rocket.jpg",
            },
            {
                defense_points: 120,
                attack_points: 130,
                cost: 3,
                alias: "Venom",
                imgName: "venom.png",
            },
            {
                defense_points: 100,
                attack_points: 150,
                cost: 5,
                alias: "Wonder Woman",
                imgName: "wonderwoman.png",
            },
        ]

        this.displayPlayer(player, true);
        this.displayPlayer(opponent, false);
        this.renderDeckCardsFor("player");
        this.renderDeckCardsFor("opponent");

        this.updateCards(cards);
        this.updateOpponentCards(opponentCards);
        this.field.addOpponentCard(opponentCards[0]);
        this.field.addOpponentCard(opponentCards[2]);

    }

}

export default Game;

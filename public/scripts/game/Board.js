import Card from "./Card.js";

class Board {

    constructor(player) {

        this.player = player;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.cards = [];
        this.oppCards = [];
        this.updateMana(this.player.mana);
        this.setBoardEvents();
    
    }

    setBoardEvents() {

        this.player.socket.on('clickCard', (cardId, isTarget, attackerId) => {
            let card = this.findCardById(cardId, isTarget);

            if (isTarget) {
                let attacker = this.findCardById(attackerId, false);

                card.cardHTML.classList.add("target-card");

                setTimeout(() => {
                    attacker.cardHTML.classList.remove("attacker-card");
                    card.cardHTML.classList.remove("target-card");
                }, 3000);
            }
            else {
                card.cardHTML.classList.add("attacker-card");
            }
        });

    }

    findCardById(id, isYours) {

        let cardArr = isYours ? this.cards : this.oppCards;

        let card = cardArr.find((card) => {
            return card.cardData.id === id;
        });

        return card;

    }

    attackInProgress() {
        
        return this.selectedAttacker && this.selectedTarget;

    }

    clearAttacker() {
        
        if (!this.selectedAttacker) return;
        this.selectedAttacker.cardHTML.classList.remove("attacker-card");
        this.selectedAttacker = null;
        
    }
    
    clearTarget() {
        
        if (!this.selectedTarget) return;
        this.selectedTarget.cardHTML.classList.remove("target-card");
        this.selectedTarget = null;
    
    }

    clearAttack() {

        setTimeout(() => {
            this.clearAttacker();
            this.clearTarget();
        }, 3000);

    }

    addOpponentCard(cardData) {

        let card = new Card(cardData, this);
        card.render(`.game-field .opponent-field`, true);
        card.fillCardData();
        card.cardHTML.classList.add("enemy-card", "played");

        card.cardHTML.addEventListener("click", () => {

            if (this.attackInProgress() || !this.player.turn)
                return;

            if (this.selectedAttacker) {


                // this.clearTarget();
                this.selectedTarget = card;
                card.cardHTML.classList.add("target-card");
                this.player.socket.emit("clickCard", card.cardData.id, true, this.selectedAttacker.cardData.id);
                console.log(`${this.selectedAttacker.cardData.alias}'s attacking
                            ${this.selectedTarget.cardData.alias}`);

                this.player.socket.emit("attackCard", this.selectedAttacker.cardData.id, this.selectedTarget.cardData.id);

                this.clearAttack();

            }

        });

        this.oppCards.push(card);

        const oppCards = document.querySelector(`.opponent-container .card-container`);
        oppCards.removeChild(oppCards.lastChild);

    }

    addPlayerCard(card) {

        if (this.player.mana - card.cardData.cost < 0)
            return;

        const cardContainer = document.querySelector(`.game-field .player-field`);
        card.cardHTML.classList.add("played");
        card.cardHTML.addEventListener("click", () => {

            if (this.attackInProgress() || !this.player.turn)
                return;

            this.clearAttacker();
            this.selectedAttacker = card;
            card.cardHTML.classList.add("attacker-card");
            this.player.socket.emit("clickCard", card.cardData.id, false);

        });

        let idx = this.player.hand.findIndex(elem => elem.id === card.cardData.id);
        this.player.hand.splice(idx, 1);
        this.player.socket.emit("moveCardToBoard", card.cardData.id);

        cardContainer.appendChild(card.cardHTML);
        card.clearCardEvents();
        this.cards.push(card);
        this.player.mana -= card.cardData.cost;
        this.updateMana();

    }

    updateMana(newTurn = false) {
        
        const manaCount = document.querySelector(".mana-count");
        let currentMana = this.player.mana;
        let allMana;
        if (newTurn) {
            allMana = this.player.mana;
        }
        else {
            if (manaCount.textContent) {
                allMana = manaCount.textContent.split('/')[1];
            }
            else {
                allMana = 0;
            }
        }
        manaCount.textContent = `${currentMana}/${allMana}`;
        const manaBar = document.querySelector(".mana-progress-bar");
        manaBar.style.width = `${currentMana * 10}%`;

    }

    clearChosenCards() {

        this.cards.forEach((card) => {
            card.cardHTML.classList.remove("attacker-card");
            card.cardHTML.classList.remove("target-card");
        });

        this.oppCards.forEach((card) => {
            card.cardHTML.classList.remove("attacker-card");
            card.cardHTML.classList.remove("target-card");
        });

    }

}

export default Board;

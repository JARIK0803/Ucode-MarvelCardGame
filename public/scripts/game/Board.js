import Card from "./Card.js";

class Board {

    constructor(player) {

        this.player = player;
        this.selectedAttacker = null;
        this.selectedTarget = null;
        this.cards = [];
        this.updateMana(this.player.mana);
    
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

            if (this.attackInProgress())
                return;

            if (this.selectedAttacker) {

                // this.clearTarget();
                this.selectedTarget = card;
                card.cardHTML.classList.add("target-card");
                console.log(`${this.selectedAttacker.cardData.alias}'s attacking
                            ${this.selectedTarget.cardData.alias}`);

                // submit the attack
                this.player.socket.emit("attackCard", this.selectedAttacker.cardData.id, this.selectedTarget.cardData.id);

                this.clearAttack();

            }

        });

        const oppCards = document.querySelector(`.opponent-container .card-container`);
        oppCards.removeChild(oppCards.lastChild);

    }

    addPlayerCard(card) {

        if (this.player.mana - card.cardData.cost < 0)
            return;

        const cardContainer = document.querySelector(`.game-field .player-field`);
        card.cardHTML.classList.add("played");
        card.cardHTML.addEventListener("click", () => {

            if (this.attackInProgress())
                return;

            this.clearAttacker();
            this.selectedAttacker = card;
            card.cardHTML.classList.add("attacker-card");

        });

        let idx = this.player.hand.findIndex(elem => elem.id === card.cardData.id);
        this.player.hand.splice(idx, 1);
        this.player.socket.emit("moveCardToBoard", card.cardData.id);

        cardContainer.appendChild(card.cardHTML);
        card.clearCardEvents();
        this.cards.push(card.cardData);
        // socket event here
        this.player.mana -= card.cardData.cost;
        this.updateMana();

    }

    updateMana() {

        const manaCount = document.querySelector(".mana-count");
        let currentMana = this.player.mana;
        manaCount.textContent = `${currentMana}/10`;
        const manaBar = document.querySelector(".mana-progress-bar");
        manaBar.style.width = `${currentMana * 10}%`;

    }

}

export default Board;

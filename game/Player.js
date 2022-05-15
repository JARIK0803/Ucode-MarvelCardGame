import db from "../models/index.js";

const Card = db.sequelize.models.card;
const User = db.sequelize.models.user;

class Player {

    static START_HP = 30;
    static MAX_MANA = 10;
    static START_MANA = 0;
    static MAX_CARDS_IN_HAND = 8;
    static MAX_CARDS_ON_BOARD = 5;

    static DECK_CARD_COUNT = 10;

    constructor (user) {
        //перевірка чи ататкувала карта цього ходу
        //визначити як відобоажувати: карта вже ходила, недостатньо монет для переміщення карти на стіл, максимальна кількість карт в руці, макс кількість карт на столі
        this.socket = user.socket;
        this.userID = user.id;

        this.user = null;
        
        this.nickname = '';
        this.avatar = '';

        this.cardDeck = [];
        this.hand = [];
        this.board = [];
        
        this.hp = Player.START_HP;
        this.allMana = Player.START_MANA;
        this.currMana = Player.START_MANA;
        
    }
    
    async init() {
        
        try {
            let user = await User.findByPk(this.userID);
            this.nickname = user.nickname;
            if (user.avatar) {
                this.avatar = Buffer.from(user.avatar, "binary").toString("base64");
            } else {
                this.avatar = null;
            } 

            await this.initDeck();        
        }
        catch (err) {
            console.error(err);
        }

    }

    // getRandomCards(cards, num) {
        
    //     let allCards = [ ...cards, ...cards ];
    //     const shuffled = allCards.sort(() => 0.5 - Math.random());
    //     return shuffled.slice(0, num);
        
    // }

    startTurn() {
        let cards = [];
        if (this.cardDeck.length)
            cards = this.getCardsToHand(1);

        if (this.allMana < Player.MAX_MANA)
            this.allMana++;
        this.currMana = this.allMana;

        return {newCard: cards, allMana: this.allMana, currMana: this.currMana};
    }

    reduceHp(value) {
        this.hp -= value;
    }

    getCardsToHand(numOfCards) {
        let result = [];

        for (let i = 0; i < numOfCards; i++) {
            if (this.cardDeck.length && this.hand.length <= Player.MAX_CARDS_IN_HAND) {
                let card = this.cardDeck.pop();
                this.hand.push(card);
                result.push(card);
            } else {
                this.reduceHp(1);
            }
        }

        return result;
    }

    moveCardToBoard(cardId) {
        let idx = this.hand.findIndex(elem => elem.id === cardId);

        if (this.board.length <= Player.MAX_CARDS_ON_BOARD && this.hand[idx].cost <= this.currMana) {
            let card = this.hand.splice(idx, 1)[0];
            this.board.push(card);
            this.currMana -= card.cost;
            return true;
        }
        return false;
        // let a = {
        //     startCardStats: '',
        //     currCardStats: '',
        //     active: false
        // }
    }

    attackCardOnBoard(targetId, reduceHp) {
        let idx = this.board.findIndex(elem => elem.id === targetId);
        const cardUnderAttack = this.board[idx];
        cardUnderAttack.defense_points -= reduceHp;

        if (cardUnderAttack.defense_points <= 0)
            this.board.splice(idx, 1);
    }
    
    async initDeck() {

        let cards = await Card.findAll({
            attributes: {
                exclude: ["id", "created_at", "updated_at"]
            }
        });

        // this.cardDeck = this.getRandomCards(cards, Player.DECK_CARD_COUNT)
        //     .map(card => card.dataValues);
        this.cardDeck = [...cards, ...cards].map((card, idx) => {
            let cardData = card.dataValues;
            cardData.id = idx; //set unique id for all cards in deck
            return {...cardData};
        }).sort(() => 0.5 - Math.random());
    }

}

export default Player;
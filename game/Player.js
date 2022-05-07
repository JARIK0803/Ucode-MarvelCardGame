import db from "../models/index.js";

const Card = db.sequelize.models.card;
const User = db.sequelize.models.user;

class Player {

    static START_AVATAR_HP = 30;
    static MAX_COINS = 10;
    static START_COINS = 0;
    static MAX_CARDS_IN_HAND = 10;
    static MAX_CARDS_ON_BOARD = 8;

    static DECK_CARD_COUNT = 10;

    constructor (user) {
        //перевірка чи ататкувала карта цього ходу
        //визначити як відобоажувати: карта вже ходила, недостатньо монет для переміщення карти на стіл, максимальна кількість карт в руці, макс кількість карт на столі
        this.socket = user.socket;
        this.userID = user.id;
        this.user = null;

        this.cardDeck = [];
        
        this.avatarHp = Player.START_AVATAR_HP;

        this.allCoins = Player.START_COINS;
        this.currCoins = Player.START_COINS;
        
        this.hand = [];
        this.board = [];
        
    }
    
    async init() {
        
        try {
            this.user = await User.findByPk(this.userID);
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
        let card = [];
        if (this.cardDeck.length)
            card = this.getCardsToHand(1);

        if (this.allCoins < Player.MAX_COINS)
            this.allCoins++;
        this.currCoins = this.allCoins;

        return {newCardsInHand: card, allCoins: this.allCoins, currCoins: this.currCoins};
    }

    reduceAvatarHp(value) {
        this.avatarHp -= value;
    }

    getCardsToHand(numOfCards) {
        let result = [];

        for (let i = 0; i < numOfCards; i++) {
            if (this.cardDeck.length && this.hand.length <= Player.MAX_CARDS_IN_HAND) {
                let tmp = this.cardDeck.pop();
                this.hand.push({...tmp});
                result.push({...tmp});
            } else {
                this.reduceAvatarHp(1);
            }
        }

        return result;
    }

    moveCardToBoard(idx) {
        if (this.board.length <= Player.MAX_CARDS_ON_BOARD && this.hand[idx].cost <= this.coins) {
            let card = this.hand.splice(idx, 1);
            this.board.push(card);
            this.coins -= card.cost;
        }

        // let a = {
        //     startCardStats: '',
        //     currCardStats: '',
        //     active: false
        // }
    }

    attackCardOnBoard(cardIdx, reduceHp) {
        const cardUnderAttack = this.board[cardIdx];
        cardUnderAttack.defense_points -= reduceHp;

        if (cardUnderAttack.defense_points < 0)
            this.board.splice(cardIdx, 1);
    }
    
    async initDeck() {

        let cards = await Card.findAll({
            attributes: {
                exclude: ["created_at", "updated_at"]
            }
        });
        // this.cardDeck = this.getRandomCards(cards, Player.DECK_CARD_COUNT)
        //     .map(card => card.dataValues);
        this.cardDeck = cards.map(card => card.dataValues).sort(() => 0.5 - Math.random());
        console.log(cards.length);
        console.log(this.cardDeck.length);

        
        console.log("Cards");
        console.dir(this.cardDeck);

    }

}

export default Player;
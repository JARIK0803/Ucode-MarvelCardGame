import db from "../models/index.js";

const Card = db.sequelize.models.card;
const User = db.sequelize.models.user;

class Player {

    static DECK_CARD_COUNT = 10;
    constructor (user) {
        
        this.socket = user.socket;
        this.userID = user.id;
        this.user = null;
        this.cardDeck = null;
        
    }
    
    async init() {
        
        try {
            this.user = await User.findByPk(this.userID);
            await this.initCards();        
        }
        catch (err) {
            console.error(err);
        }

    }

    getRandomCards(cards, num) {
        
        let allCards = [ ...cards, ...cards ];
        const shuffled = allCards.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
        
    }
    
    async initCards() {

        let cards = await Card.findAll({
            attributes: {
                exclude: ["created_at", "updated_at"]
            }
        });
        this.cardDeck = this.getRandomCards(cards, Player.DECK_CARD_COUNT)
            .map(card => card.dataValues);
            
        console.log("Cards");
        console.dir(this.cardDeck);

    }

}

export default Player;
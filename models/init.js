import mysql from "mysql2/promise";
import db from "./index.js";

const Card = db.sequelize.models.card; 

async function initializeCards() {

    await Card.bulkCreate([
        { alias: "Thor", attack_points: 150, defense_points: 100, cost: 1, img: "thor.jpg" },
        { alias: "Iron Man", attack_points: 130, defense_points: 90, cost: 1, img: "ironman.jpg" },
        { alias: "Spider Man", attack_points: 140, defense_points: 80, cost: 1, img: "spiderman.png" },
        { alias: "Thanos", attack_points: 100, defense_points: 90, cost: 1, img: "thanos.jpg" },
        { alias: "Captain America", attack_points: 130, defense_points: 100, cost: 1, img: "cptn_america.jpg" },
        { alias: "Wonder Woman", attack_points: 120, defense_points: 90, cost: 1, img: "wonder_woman.png" },
        { alias: "Hulk", attack_points: 130, defense_points: 120, cost: 1, img: "hulk.jpg" },
        { alias: "Rocket", attack_points: 100, defense_points: 80, cost: 1, img: "rocket.jpg" },
        { alias: "Venom", attack_points: 130, defense_points: 90, cost: 1, img: "venom.png" },
        { alias: "Gamora", attack_points: 100, defense_points: 110, cost: 1, img: "gamora.jpg" },
    ]);

}

export default async function initialize() {

    const { host, user, password, database } = db.options;
    const conn = await mysql.createConnection({ host: host, user: user, password: password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${database};`);

    await db.sequelize.sync();

    let existsQuery = `EXISTS (SELECT * FROM ${database}.cards)`;
    let cards = await db.sequelize.query(`SELECT ${existsQuery}`);
    
    if (!cards[0][0][existsQuery])
        await initializeCards();

}

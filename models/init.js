import mysql from "mysql2/promise";
import db from "./index.js";

const Card = db.sequelize.models.card; 

async function initializeCards() {

    await Card.bulkCreate([
        { alias: "Thor", attack_points: 150, defense_points: 100, cost: 1 },
        { alias: "Iron Man", attack_points: 130, defense_points: 90, cost: 1 },
        { alias: "Spider Man", attack_points: 140, defense_points: 80, cost: 1 },
        { alias: "Thanos", attack_points: 100, defense_points: 90, cost: 1 },
        { alias: "Captain America", attack_points: 130, defense_points: 100, cost: 1 },
        { alias: "Black Widow", attack_points: 120, defense_points: 90, cost: 1 },
        { alias: "Hulk", attack_points: 130, defense_points: 120, cost: 1 },
        { alias: "Rocket", attack_points: 100, defense_points: 80, cost: 1 },
        { alias: "Gamora", attack_points: 130, defense_points: 90, cost: 1 },
        { alias: "Superman", attack_points: 100, defense_points: 110, cost: 1 },
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

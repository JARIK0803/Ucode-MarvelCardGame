import mysql from "mysql2/promise";
import db from "./index.js";

// const Card = db.sequelize.models.card; 

// async function initializeCards() {

//     await Card.bulkCreate([
//         { alias: "Thor", attack_points: 150, defense_points: 100, cost: 5 },
//         { alias: "Iron Man", attack_points: 130, defense_points: 90, cost: 5 },
//         { alias: "Spider Man", attack_points: 140, defense_points: 80, cost: 5 },
//         { alias: "Thanos", attack_points: 100, defense_points: 90, cost: 5 },
//         { alias: "Captain America", attack_points: 130, defense_points: 100, cost: 5 },
//         { alias: "Black Widow", attack_points: 120, defense_points: 90, cost: 5 },
//         { alias: "Hulk", attack_points: 130, defense_points: 120, cost: 5 },
//         { alias: "Rocket", attack_points: 100, defense_points: 80, cost: 5 },
//         { alias: "Gamora", attack_points: 130, defense_points: 90, cost: 5 },
//         { alias: "Superman", attack_points: 100, defense_points: 110, cost: 5 },
//     ]);

// }

export default async function initialize() {

    const { user, password, host, port, database } = db.options;
    const conn = await mysql.createConnection({ user, password, host, port });
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${database};`);

    await db.sequelize.sync();

    // await initializeCards();

}

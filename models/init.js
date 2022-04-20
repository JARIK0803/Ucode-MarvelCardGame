import mysql from "mysql2/promise";
import db from "./index.js";

export default async function initialize() {

    const { user, password, host, port, database } = db.options;
    const conn = await mysql.createConnection({ user, password, host, port });
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${database};`);

    await db.sequelize.sync();

}

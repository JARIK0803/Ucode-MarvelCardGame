import path from "path";
import fs from "fs";
import { Sequelize, DataTypes } from "sequelize";
import initUser from "./user.js";
import initCard from "./card.js";
// more models here

const dbFilePath = path.resolve("config", "db-config.json");
const dbOptFile = fs.readFileSync(dbFilePath);
const dbOptions = JSON.parse(dbOptFile);

const sequelize = new Sequelize(
    dbOptions.database,
    dbOptions.user,
    dbOptions.password,
    {
        dialect: dbOptions.dialect,
        pool: dbOptions.pool,
        // logging: false,
    },
);

initUser(sequelize, DataTypes);
initCard(sequelize, DataTypes);
// other models here

const db = {};
db.sequelize = sequelize;
db.options = dbOptions;

export default db;
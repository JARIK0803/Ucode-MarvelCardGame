import path from "path";
import fs from "fs";
import { Sequelize, DataTypes } from "sequelize";
import initUser from "./user.js";
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
        pool: dbOptions.pool
    }
);

const User = initUser(sequelize, DataTypes);
// other models here

const db = {};
db.sequelize = sequelize;
db.options = dbOptions;
db.DataTypes = DataTypes;
db.models = { User: User };

export default db;
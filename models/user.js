const strRegexp = /^\w+$/;

export default function initUser (sequelize, DataTypes) {

    return sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        login: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            // validate: {
            //     is: strRegexp
            // }
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            // validate: {
            //     is: strRegexp
            // }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            // validate: {
            //     is: strRegexp
            // }
        },
        avatar: {
            type: DataTypes.BLOB
        }
    });

}

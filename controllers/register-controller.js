"use strict";
import bcrypt from "bcrypt";
import db from "../models/index.js";

const User = db.sequelize.models.user;
const TYPE_SUCCESS = 'success';
const TYPE_ERROR = 'error';

async function checkLogin(newLogin) {
    let res = await User.findAll({
        where: {
            login: newLogin
        }
    })
    console.log(res);

    if (res.length) {
        return 'The user with this login already exists';
    }

    return '';
}

async function checkNickname(newNickname) {
    let res = await User.findAll({
        where: {
            nickname: newNickname
        }
    })
    console.log(res);

    if (res.length) {
        return 'The user with this nickname already exists';
    }

    return '';
}

async function checkUnique(userData) {
    let loginErrorMsg = await checkLogin(userData.login);
    let nicknameErrorMsg = await checkNickname(userData.nickname);
    let res = {};
    
    if ((res.text = loginErrorMsg || nicknameErrorMsg)) {
        res.type = TYPE_ERROR;
        return res;
    }
    
    res.type = TYPE_SUCCESS;
    res.text = 'You are successfully registered!';
    return res;
}

async function register(userData) {
    let res = await checkUnique(userData);

    if (res.type === TYPE_SUCCESS) {
        const hash = bcrypt.hashSync(userData.password, 10);
        const user = await User.create({nickname: userData.nickname, login: userData.login, password: hash});
        console.log(user.toJSON());
    }
    
    return res;
}

export default register;
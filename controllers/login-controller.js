"use strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const User = db.sequelize.models.user;
const TYPE_SUCCESS = 'success';
const TYPE_ERROR = 'error';
const TOKEN_EXPIRE_SEC = 60 * 60 * 2; // 2h
// const TOKEN_EXPIRE_SEC = 10;

function generateAccessToken(payload) {
    return jwt.sign(payload, 'secret', { expiresIn: TOKEN_EXPIRE_SEC, });
}

async function checkErrors(data, user) {
    let res = {};

    if (!(user && bcrypt.compareSync(data.password, user.password))) {
        res.type = TYPE_ERROR;
        res.text = 'Login or password is invalid';
        return res;
    }

    res.type = TYPE_SUCCESS;
    res.text = 'You are successfully logged!';

    return res; 
}

async function login(req, res) {
    const data = req.body;

    let user = await User.findOne({
        where: {
            login: data.login
        }
    });

    let result = await checkErrors(data, user);
    
    if (result.type === TYPE_SUCCESS) {
        const token = generateAccessToken({ nickname: user.nickname });
        res.cookie('token', token, {maxAge: TOKEN_EXPIRE_SEC * 1000});
        result.redirect = `/`;
    }

    res.json(result);
}

export default login;
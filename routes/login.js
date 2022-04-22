import express from "express";
import path from "path";

const router = express.Router();

router.get('/', (req, res) => {
    res.render(path.resolve('public', 'views', 'login.pug'))
});

router.get('/register', (req, res) => {
    res.render(path.resolve('public', 'views', 'register.pug'))
});

export default router;
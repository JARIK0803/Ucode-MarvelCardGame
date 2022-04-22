import express from "express";
import path from "path";
import register from "../controllers/register-controller.js";

const router = express.Router();

router.get('/', (req, res) => {
    res.render(path.resolve('public', 'views', 'register.pug'))
});

router.post('/', async (req, res) => {
    const data = req.body;
    const result = await register(data);
    res.json(result);
});

// router.get('/login', (req, res) => {
//     res.redirect('/');
// });

export default router;
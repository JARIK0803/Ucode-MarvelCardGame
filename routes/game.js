import express from "express";
import path from "path";

const router = express.Router();

router.get('/', (req, res) => {
    res.render(path.resolve('public', 'views', 'game_copy.pug'))
});

export default router;

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import initialize from "./models/init.js";

import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";

const app = express();
const port = 3000;
const host = "localhost";

initialize()
    .catch(err => console.error(err));

app.set("view engine", "pug");
app.set("views", path.resolve("public", "views"));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.resolve("public")));

function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(300).redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    
    next();
}

app.use('(^(?!/login))(^(?!/register))', authenticateToken);

app.get('/', (req, res) => {
    res.render(path.resolve('public', 'views', 'index.pug'));
});

app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.listen(port, host, () => {
    console.log(`Listening on port ${port}, with host ${host}.`);
});

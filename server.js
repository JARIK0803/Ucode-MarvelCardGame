import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import initialize from "./models/init.js";
import authenticateToken from "./middleware/auth.js";
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

app.use('(^(?!/login))(^(?!/register))', authenticateToken); // for all urls which don't start with /login and /register

app.get('/', (req, res) => {
    res.render(path.resolve('public', 'views', 'index.pug'));
});

app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.listen(port, host, () => {
    console.log(`Listening on port ${port}, with host ${host}.`);
});

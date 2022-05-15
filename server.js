import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import initialize from "./models/init.js";
import authenticateToken from "./middleware/auth.js";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import uploadRouter from "./routes/avatar-upload.js";
import gameRouter from "./routes/game.js";
import http from 'http';

const app = express();
const port = 3000;
const host = "localhost";
const viewPath = path.join("public", "views");

const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server);
import ioHandler from "./socket.js";
io.on('connection', ioHandler.bind(io));

initialize()
    .catch(err => console.error(err));

app.set("view engine", "pug");
app.set("views", path.resolve(viewPath));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.resolve("public")));

app.use('(^(?!/login))(^(?!/register))', authenticateToken); // for all urls which don't start with /login and /register

app.get('/', (req, res) => {
    res.render(path.resolve(viewPath, 'index.pug'));
});

app.use('/', uploadRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/game', gameRouter);

app.get('/waiting', (req, res) => {
    res.render(path.resolve(viewPath, 'waiting.pug'));
});

server.listen(port, host, () => {
    console.log(`App running at port: ${port}, host: ${host}.\n`);
});

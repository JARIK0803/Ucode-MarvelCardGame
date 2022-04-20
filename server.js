import express from "express";
import path from "path";
import initialize from "./models/init.js";

const app = express();
const port = 3000;
const host = "localhost";

initialize()
    .catch(err => console.error(err));

app.set("view engine", "pug");
app.set("views", path.resolve("public", "views"));

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(path.resolve("public"))
);

app.listen(port, host, () => {

    console.log(`Listening on port ${port}, with host ${host}.`);

});

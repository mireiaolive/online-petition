const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
var cookieSession = require("cookie-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/petition", function (req, res) {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/petition", (req, res) => {
    db.getData()
        .then(({ rows }) => {
            console.log("data from db: ", rows);
        })
        .catch((err) => console.log("err in/data: ", err));
});

app.post("/petition", (req, res) => {
    //data that the user sent to us
    db.addData("first", "last", "signature")
        .then(() => {
            console.log("we added data");
        })
        .catch((err) => console.log("err in post/add-data: ", err));
});

app.get("/thanks", function (req, res) {
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", function (req, res) {
    res.render("signers", {
        layout: "main",
    });
});

app.listen(8080, () => console.log("petition server is listening... "));

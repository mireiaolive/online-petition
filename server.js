const express = require("express");
const app = express();
const db = require("./db");

app.use(express.static("./public"));

app.get("/cities", (req, res) => {
    db.getCities()
        .then(({ rows }) => {
            console.log("data from db: ", rows);
        })
        .catch((err) => console.log("err in/cities: ", err));
});

app.post("/add-city", (req, res) => {
    //data that the user sent to us
    db.addCity("Cuenca", "Ecuador")
        .then(() => {
            console.log("we added a city");
        })
        .catch((err) => console.log("err in post/add-city: ", err));
});
app.listen(8080, () => console.log("petition server is listening... "));

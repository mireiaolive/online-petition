var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//to add rows to a table, with the name of the table, and columns you insert and values
module.exports.clickSubmit = (first, last, signature) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
};

//we use where to get more specific with the search
module.exports.getSign = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${id}`);
};

//count returns the number of rows in a specified table, and it preserves duplicate rows
module.exports.getTotal = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getNames = () => {
    return db.query(`SELECT first, last FROM signatures`);
};

//we use where to get more specific with the search
module.exports.getEmail = (mail) => {
    return db.query(`SELECT * FROM users WHERE email = ${email}`);
};

//to add rows to a table, with the name of the table, and columns you insert and values
module.exports.addProfile = (city, age, homepage, userId) => {
    return db.query(
        `INSERT INTO profiles (userid, age, city, homepage) values ($1, $2, $3, $4)`,
        [userId, age, city, homepage]
    );
};

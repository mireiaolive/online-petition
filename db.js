var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:password@localhost:5432/petition");

module.exports.clickSubmit = (first, last, signature) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
};

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

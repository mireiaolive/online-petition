var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.clickSubmit = (first, last, email, hashedpassword) => {
    return db.query(
        `INSERT INTO users (first, last, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, hashedpassword]
    );
};

module.exports.clickSubmitSignature = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, userId]
    );
};

module.exports.getSign = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${id}`);
};

module.exports.getTotal = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getNames = () => {
    return db.query(
        `SELECT users.first, users.last , profiles.age, profiles.city, profiles.homepage FROM users
        INNER JOIN signatures ON signatures.user_id = users.id
        FULL JOIN profiles ON profiles.user_id=users.id`
    );
};

module.exports.getEmail = (email) => {
    return db.query(`SELECT * FROM users WHERE email = '${email}'`);
};

module.exports.addProfile = (age, city, homepage, userId) => {
    return db.query(
        `INSERT INTO profiles (user_id, age, city, homepage) values ($1, $2, $3, $4)`,
        [userId, age, city, homepage]
    );
};

module.exports.getCity = (city) => {
    console.log("city: ", city);
    return db.query(
        `SELECT users.first, users.last, profiles.age, profiles.city, profiles.homepage FROM users INNER JOIN signatures ON signatures.user_id = users.id 
        FULL JOIN profiles ON profiles.user_id = users.id WHERE LOWER(city) = LOWER($1)`,
        [city]
    );
};

module.exports.getEdit = (id) => {
    return db.query(
        `SELECT users.first, users.last, users.email, profiles.age, profiles.city, profiles.homepage
        FROM users FULL join profiles ON users.id = profiles.user_id
        WHERE users.id = ($1)`,
        [id]
    );
};

module.exports.editPass = (id, first, last, email, hashedpassword) => {
    return db.query(
        `INSERT INTO users (id, first, last, email, hashed_password) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id)
        DO UPDATE SET first = $2, last = $3, email = $4, hashed_password = $5 WHERE users.id = $1`,
        [id, first, last, email, hashedpassword]
    );
};

module.exports.updateUser = (first, last, email, id) => {
    return db.query(
        `UPDATE users SET first = $2, last = $3, email = $4 WHERE id = $1`,
        [first, last, email, id]
    );
};

module.exports.editProfile = (age, city, homepage, id) => {
    return db.query(
        `INSERT INTO profiles (age, city, homepage, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, homepage = $3`,
        [age, city, homepage, id]
    );
};

module.exports.deleteProfile = (id) => {
    return db.query(`DELETE FROM profiles WHERE user_id = ($1)`, [id]);
};

module.exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE user_id = ($1)`, [id]);
};

module.exports.deleteUser = (id) => {
    return db.query(`DELETE FROM users WHERE id = ($1)`, [id]);
};

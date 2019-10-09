const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.getFullName = () => {
    return db.query(`SELECT first, last FROM signatures`);
};

module.exports.showSignature = idCookie => {
    return db.query(`SELECT first, signature FROM signatures WHERE id = $1`, [
        idCookie
    ]);
    // return db.query(
    //     `SELECT first, signature FROM signatures WHERE id = ${idCookie}`
    // );
};

module.exports.getNumSigners = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

exports.addInfo = (first, last, signature, userId) => {
    return db.query(
        `
        INSERT INTO signatures (first, last, signature, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [first, last, signature, userId]
    );
};

exports.register = (first, last, email, password) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [first, last, email, password]
    );
};

exports.getPassword = email => {
    return db.query(
        `
        SELECT password, id FROM users WHERE email = $1
        `,
        [email]
    );
};

exports.addProfile = (age, city, homepage, userId) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, homepage, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [age, city, homepage, userId]
    );
};

`SELECT signature FROM signatures WHERE id = $1`;
// for thanks db query

// db.query(
//     `INSERT INTO signatures (first, last)
//             VALUES (${first}, ${last})
//             RETURNING *`
// ).then(({ rows }) => console.log(rows).catch(err => console.log(err.massage)));

// db.query(`SELECT * FROM cities WHERE city = 'Berlin'`).then(({ rows }) =>
//     console.log(rows).ctch(err => console.log(err.massage))
// );

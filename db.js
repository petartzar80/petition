const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

module.exports.getFullName = () => {
    return db.query(`SELECT first as first_name, last as last_name, age as age_int, city as residence, homepage as url FROM signatures
    LEFT JOIN users
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    `);
};

module.exports.getEditProfile = id => {
    return db.query(
        `SELECT first as first_name, last as last_name, email as mail, age as age_int, city as residence, homepage as url FROM signatures
        LEFT JOIN users
        ON users.id = signatures.user_id
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = $1
        `,
        [id]
    );
};

module.exports.getCities = city => {
    return db.query(
        `SELECT first as first_name, last as last_name, age as age_int, city as residence, homepage as url FROM signatures
        LEFT JOIN users
        ON users.id = signatures.user_id
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
    WHERE LOWER (city) = LOWER ($1)`,
        [city]
    );
};

module.exports.showSignature = idCookie => {
    return db.query(
        `
        SELECT signature, first
        FROM signatures
        LEFT JOIN users
        ON users.id = signatures.user_id
        WHERE user_id = $1
        `,
        [idCookie]
    );
    // return db.query(
    //     `SELECT first, signature FROM signatures WHERE id = ${idCookie}`
    // );
};

// db.query('', [age || null],)
// for handling age

module.exports.getNumSigners = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

exports.addInfo = (signature, userId) => {
    return db.query(
        `
        INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2)
        RETURNING id
        `,
        [signature, userId]
    );
};

exports.getIfSigned = id => {
    return db.query(
        `
        SELECT user_id FROM signatures WHERE id = $1
        `,
        [id]
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

exports.deleteSig = id => {
    return db.query(
        `
        DELETE FROM signatures WHERE id = $1;
        `,
        [id]
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

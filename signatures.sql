DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first VARCHAR(200) NOT NULL CHECK (first != ''),
    last VARCHAR(200) NOT NULL CHECK (last != ''),
    signature TEXT NOT NULL
);

-- INSERT INTO signatures (first, last, signature) VALUES ('Bla', 'Blabla', 'jhsdsfsdjkhgslk');
-- INSERT INTO signatures (first, last, signature) VALUES (firstName, lastName, signature);



SELECT * FROM signatures;

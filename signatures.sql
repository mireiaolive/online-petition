DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL,
    last VARCHAR NOT NULL,
     email VARCHAR UNIQUE NOT NULL,
     hashed_password VARCHAR NOT NULL
);

DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL,
     last VARCHAR NOT NULL,
     signature VARCHAR NOT NULL,
     user_id INT NULL REFERENCES users(id)
);
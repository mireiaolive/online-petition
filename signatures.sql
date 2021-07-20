DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL (first <> ''),
    last VARCHAR NOT NULL (last <> ''),
     email VARCHAR UNIQUE NOT NULL (email <> ''),
     hashed_password VARCHAR NOT NULL (hashed_password <> '')
);


CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
     signature VARCHAR NOT NULL CHECK (signature != ''),
     
);

CREATE TABLE profiles (
     id SERIAL PRIMARY KEY,
     age INTEGER,
     city TEXT,
     homepage TEXT,
     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)   
);
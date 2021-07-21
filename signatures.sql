DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first <> ''),
    last VARCHAR NOT NULL CHECK (last <> ''),
     email VARCHAR UNIQUE NOT NULL CHECK (email <> ''),
     hashed_password VARCHAR NOT NULL CHECK (hashed_password <> '')
);


CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     first VARCHAR NOT NULL CHECK (first != ''),
     last VARCHAR NOT NULL CHECK (last != ''),
     signature VARCHAR NOT NULL CHECK (signature != '')   
);

CREATE TABLE profiles (
     id SERIAL PRIMARY KEY,
     age INTEGER,
     city TEXT,
     homepage TEXT,
     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)   
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL,
     last VARCHAR NOT NULL,
      email VARCHAR UNIQUE NOT NULL,
      hashed_password VARCHAR NOT NULL
);
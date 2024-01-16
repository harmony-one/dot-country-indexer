CREATE TABLE domains (
    domain_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL
);

CREATE TYPE url_type AS ENUM ('path', 'subdomain');

CREATE TABLE urls (
    url_id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    type url_type NOT NULL,
    url VARCHAR(255) NOT NULL,
    domain_id INT,
    FOREIGN KEY (domain_id) REFERENCES domains(domain_id)
);

ALTER TABLE urls ADD UNIQUE (domain_id, identifier, type);
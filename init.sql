CREATE TABLE IF NOT EXISTS users(userId SERIAL PRIMARY KEY, username varchar(20), passw varchar(20));
CREATE TABLE IF NOT EXISTS sessions(sessionId SERIAL PRIMARY KEY,userId BIGINT, expiresAt BIGINT);
INSERT INTO users(username, passw) VALUES ('test', 'test');
CREATE USER postgres SUPERUSER;
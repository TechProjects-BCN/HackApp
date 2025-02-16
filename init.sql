CREATE TABLE IF NOT EXISTS groups(groupId SERIAL PRIMARY KEY, username varchar(20), passw varchar(20), groupName varchar(20), groupNumber BIGINT);
CREATE TABLE IF NOT EXISTS sessions(sessionId SERIAL PRIMARY KEY, groupId BIGINT, expiresAt BIGINT);
INSERT INTO groups(username, passw, groupName, groupNumber) VALUES ('test', 'test', 'Laser Harp', 1);
CREATE USER postgres SUPERUSER;
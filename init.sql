CREATE TABLE IF NOT EXISTS groups(groupId SERIAL PRIMARY KEY, username varchar(20), passw varchar(20), groupName varchar(20), groupNumber BIGINT, eventID BIGINT);
CREATE TABLE IF NOT EXISTS sessions(sessionId SERIAL PRIMARY KEY, groupId BIGINT, expiresAt BIGINT);
INSERT INTO groups(username, passw, groupName, groupNumber, eventID) VALUES ('test', 'test', 'Laser Harp', 1, 0);
CREATE USER postgres SUPERUSER;
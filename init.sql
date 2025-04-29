CREATE TABLE IF NOT EXISTS groups(groupId SERIAL PRIMARY KEY, username varchar(20), passw varchar(20), groupName varchar(20), groupNumber BIGINT, isAdmin INT, eventID BIGINT);
CREATE TABLE IF NOT EXISTS sessions(sessionId SERIAL PRIMARY KEY, groupId BIGINT, expiresAt BIGINT);
CREATE TABLE IF NOT EXISTS accepted(requestId SERIAL PRIMARY KEY, groupId BIGINT, spotId BIGINT, spotType varchar(20), groupName varchar(20), groupNumber BIGINT, eventID BIGINT, AcceptedTime BIGINT);
CREATE TABLE IF NOT EXISTS spots(requestId SERIAL PRIMARY KEY, acceptedId BIGINT, groupId BIGINT, spotId BIGINT, spotType varchar(20), groupName varchar(20), groupNumber BIGINT, eventID BIGINT, LeftTime BIGINT);
CREATE TABLE IF NOT EXISTS admins(adminId SERIAL PRIMARY KEY, groupId BIGINT);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('admin', 'admin', 'Administrator', 1, 1, 0);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('laser', 'harp', 'Laser Harp', 2, 0, 0);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('water', 'fountain', 'Water Fountain', 3, 0, 0);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('robotic', 'arm', 'Robotic Arm', 4, 0, 0);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('rc', 'car', 'RC Car', 5, 0, 0);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('solar', 'etcher', 'Solar Etcher', 6, 0, 0);
INSERT INTO groups(username, passw, groupName, groupNumber, isAdmin, eventID) VALUES ('admin', 'admin', 'Administrator', 1, 0, 0);
INSERT INTO admins(groupId) VALUES (1);

CREATE USER postgres SUPERUSER;
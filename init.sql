CREATE TABLE IF NOT EXISTS groups(groupId SERIAL PRIMARY KEY, username varchar(20), password varchar(20), groupName varchar(255), groupNumber BIGINT, isAdmin INT, eventID BIGINT, members TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS sessions(sessionId SERIAL PRIMARY KEY, groupId BIGINT, expiresAt BIGINT);
CREATE TABLE IF NOT EXISTS accepted(requestId SERIAL PRIMARY KEY, groupId BIGINT, spotId BIGINT, spotType varchar(20), groupName varchar(255), groupNumber BIGINT, eventID BIGINT, AcceptedTime BIGINT);
CREATE TABLE IF NOT EXISTS spots(requestId SERIAL PRIMARY KEY, acceptedId BIGINT, groupId BIGINT, spotId BIGINT, spotType varchar(20), groupName varchar(255), groupNumber BIGINT, eventID BIGINT, LeftTime BIGINT);
CREATE TABLE IF NOT EXISTS admins(adminId SERIAL PRIMARY KEY, groupId BIGINT);
INSERT INTO groups(username, password, groupName, groupNumber, isAdmin, eventID, members) VALUES ('admin', 'admin', 'Administrator', 1, 1, 0, '');
INSERT INTO admins(groupId) VALUES (1);

CREATE USER postgres SUPERUSER;

CREATE TABLE IF NOT EXISTS assistance_log (
    id SERIAL PRIMARY KEY, 
    groupId INT, 
    duration FLOAT, 
    timestamp FLOAT
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at FLOAT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info'
);

CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at FLOAT NOT NULL
);
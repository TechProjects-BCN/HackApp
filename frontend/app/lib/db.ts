import postgres from 'postgres';

const sql = postgres({
    host: process.env.DB_HOST || '127.0.0.1',            // Postgres ip address[s] or domain name[s]
    port: 5432,          // Postgres server port[s]
    database: process.env.DB_NAME || 'techprojects',            // Name of database to connect to
    username: process.env.DB_USER || 'techprojects',            // Username of database user
    password: process.env.DB_PASSWORD || '12341234',
    connect_timeout: 5
});

export async function dbSessionFetch(groupId: number, expiresAt: number) {
    export async function dbSessionFetch(groupId: number, expiresAt: number) {
        await sql`INSERT INTO sessions(groupId, expiresAt) VALUES(${groupId}, ${expiresAt})`;
        const sessionId = await sql`SELECT sessionId FROM sessions WHERE groupId = ${groupId} AND expiresAt = ${expiresAt} `;
        return sessionId[0]["sessionid"];
    }

    export async function dbLoginGroup(username: any, password: any) {
        const response = await sql`SELECT groupId FROM groups WHERE LOWER(username) = LOWER(${username}) AND password = ${password}`;
        return response;
    }

    export async function checkAdmin(groupId: any) {
        const response = await sql`SELECT * FROM admins WHERE admins.groupId = ${groupId}; `;
        return response;
    }
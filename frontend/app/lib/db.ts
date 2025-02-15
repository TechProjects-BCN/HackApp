import postgres from 'postgres';

const sql = postgres({
    host                 : '192.168.1.36',            // Postgres ip address[s] or domain name[s]
    port                 : 5432,          // Postgres server port[s]
    database             : 'grass',            // Name of database to connect to
    username             : 'grass',            // Username of database user
    password             : '12341234',
    connect_timeout: 5  });

export async function dbSessionFetch(userId: number, expiresAt: number) {
    await sql`INSERT INTO sessions(userId, expiresAt) VALUES (${userId}, ${expiresAt})`;
    const sessionId = await sql`SELECT sessionId FROM sessions WHERE userId = ${userId} AND expiresAt = ${expiresAt}`;
    return sessionId[0]["sessionid"];
}

export async function dbLoginUser(username: any, password: any) {
    const response = await sql`SELECT userId FROM users WHERE username = ${username} AND passw = ${password}`;
    return response;
}
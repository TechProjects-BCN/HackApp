import postgres from 'postgres';

const sql = postgres({
    host                 : process.env.DB_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : 5432,          // Postgres server port[s]
    database             : process.env.DB_NAME,            // Name of database to connect to
    username             : process.env.DB_USER,            // Username of database user
    password             : process.env.DB_PASSWORD,
    connect_timeout: 5  });

export async function dbSessionFetch(groupId: number, expiresAt: number) {
    //console.log(`INSERT INTO sessions(groupId, expiresAt) VALUES (${groupId}, ${expiresAt})`);
    await sql`INSERT INTO sessions(groupId, expiresAt) VALUES (${groupId}, ${expiresAt})`;
    const sessionId = await sql`SELECT sessionId FROM sessions WHERE groupId = ${groupId} AND expiresAt = ${expiresAt}`;
    return sessionId[0]["sessionid"];
}

export async function dbLoginGroup(username: any, password: any) {
    const response = await sql`SELECT groupId FROM groups WHERE username = ${username} AND passw = ${password}`;
    return response;
}

export async function checkAdmin(groupId: any) {
    const response = await sql`SELECT * FROM admins WHERE admins.groupId = ${groupId};`;
    return response;
}
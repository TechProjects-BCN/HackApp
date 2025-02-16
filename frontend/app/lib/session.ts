"use server";

import 'server-only'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/app/lib/definitions';
import { dbSessionFetch } from '@/app/lib/db'


export async function createSession(groupId: any) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  // 1. Create a session in the database
  const sessionId = await dbSessionFetch(groupId, expiresAt.getTime());
  console.log(sessionId);

  // 2. Encrypt the session ID
  const session = await encrypt({ sessionId, groupId, expiresAt })
 
  // 3. Store the session in cookies for optimistic auth checks
  const cookieStore = await cookies();
  await cookieStore.set('session', session, {
    httpOnly: true,
    expires: expiresAt,
    maxAge: 1000,
    sameSite: 'lax',
    path: '/',
  });
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  const payload = await decrypt(session)
 
  if (!session || !payload) {
    return null
  }
 
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 
  const cookieStore = await cookies()
  await cookieStore.set('session', session, {
    httpOnly: false,
    // secure: false,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
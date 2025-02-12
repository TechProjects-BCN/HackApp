"use server";
 
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import { decrypt } from '@/app/lib/definitions';
 
export const verifySession = async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.userId) {
    redirect('/login')
  }
 
  return { isAuth: true, userId: session.userId }
}
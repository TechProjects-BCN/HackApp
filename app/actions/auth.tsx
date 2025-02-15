"use server";

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/app/lib/session';
import { dbLoginUser } from '@/app/lib/db'
import { FormState } from '@/app/lib/definitions';

export async function login(state: FormState, formData: FormData) {
  const user = { username: formData.get("username"), password: formData.get("password") };
  try{
    const userId = await dbLoginUser(user.username, user.password);
    
    await createSession(userId[0]["userid"]);

  }catch (e){
    let state: FormState = {};
    state.message = `Wrong credentials`;
    return state;
  }
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

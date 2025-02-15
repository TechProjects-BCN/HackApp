"use server";

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/app/lib/session';
import { dbLoginUser } from '@/app/lib/db'
import { FormState } from '@/app/lib/definitions';

export async function login(state: FormState, formData: FormData) {
  let st: FormState = {};
  const user = { username: formData.get("username"), password: formData.get("password") };
  try{
    var userId = await dbLoginUser(user.username, user.password);
  }catch (e){
    st.message = `DB Connection Timed Out`;
    return st;
  }    
  try{
    await createSession(userId[0]["userid"]);

  }catch (e){
    st.message = `Wrong credentials`;
    return st;
  }    

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

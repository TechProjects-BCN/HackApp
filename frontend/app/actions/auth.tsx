"use server";

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/app/lib/session';
import { dbLoginGroup } from '@/app/lib/db';
import { FormState } from '@/app/lib/definitions';

export async function login(state: FormState, formData: FormData) {
  const st: FormState = {};
  const user = { username: formData.get("username"), password: formData.get("password") };
  try{
    var groupId = await dbLoginGroup(user.username, user.password);
  }catch (e){
    st.message = `DB Connection Timed Out`;
    return st;
  }    
  try{
    await createSession(groupId[0]["groupid"]);

  }catch (e){
    st.message = `Wrong credentials: ${e}`;
    return st;
  }    

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

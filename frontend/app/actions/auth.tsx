"use server";

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/app/lib/session';
import { dbLoginGroup } from '@/app/lib/db';
import { FormState } from '@/app/lib/definitions';

export async function login(state: FormState, formData: FormData) {
  const st: FormState = {};
  const user = { username: formData.get("username"), password: formData.get("password") };
  try {
    var groupId = await dbLoginGroup(user.username, user.password);
    if (!groupId || groupId.length === 0) {
      st.message = "Invalid username or password";
      return st;
    }
  } catch (e) {
    st.message = `DB Connection Error: ${e}`;
    return st;
  }
  try {
    await createSession(groupId[0]["groupid"]);

  } catch (e) {
    st.message = `Session Error: ${e}`;
    return st;
  }

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

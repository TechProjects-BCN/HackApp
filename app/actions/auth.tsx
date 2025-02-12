"use server";

import { redirect } from 'next/navigation'
import { createSession } from '@/app/lib/session';
import { dbLoginUser } from '@/app/lib/db'

export async function login(formData: FormData) {
  const user = { username: formData.get("username"), password: formData.get("password") };
  const userId = await dbLoginUser(user.username, user.password);

  await createSession(userId[0]["userid"]);

  redirect("/");
}
"use server";
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import {encrypt, decrypt } from "@/app/lib/definitions";
import { createSession } from '@/app/lib/session';

export async function login(formData: FormData) {

  const user = { username: formData.get("username"), name: "John" };
  await createSession(0);
  console.log(user);

  redirect("/");
}
"use server";

import { decrypt } from '@/app/lib/definitions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function joinQueue(request: any) {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    console.log(`Requested Queue: ${request}, ${session?.userId}`)
    
    redirect("/queue");
}

export async function leaveQueue(request: any) {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    console.log(`Requested to Leave Queue: ${request}, ${session?.userId}`)
    
    redirect("/");
}

export async function AcceptSpot(request: any) {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    console.log(`User Has Accepted Spot: ${request}, ${session?.userId}`)
    
    redirect("/inside");
}

export async function GiveUpSpot(request: any) {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    console.log(`Requested to Give Up Spot: ${request}, ${session?.userId}`)
    
    redirect("/queue");
}

export async function LeaveSpot(request: any) {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    console.log(`Requested to Leave Spot: ${request}, ${session?.userId}`)
    
    redirect("/");
}
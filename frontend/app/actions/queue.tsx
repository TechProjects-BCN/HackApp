"use client";

import { redirect } from 'next/navigation'



export async function leaveQueue(request: any) {
    console.log(`Requested to Leave Queue: ${request}`)
    
    redirect("/");
}


export async function LeaveSpot(request: any) {
    console.log(`Requested to Leave Spot: ${request}`)
    
    redirect("/");
}
"use client";

import { redirect } from 'next/navigation'



export async function leaveQueue(request: any) {
    console.log(`Requested to Leave Queue: ${request}`)
    
    redirect("/");
}

export async function AcceptSpot(request: any) {
    console.log(`User Has Accepted Spot: ${request}`)
    
    redirect("/inside");
}

export async function GiveUpSpot(request: any) {
    console.log(`Requested to Give Up Spot: ${request}`)
    
    redirect("/queue");
}

export async function LeaveSpot(request: any) {
    console.log(`Requested to Leave Spot: ${request}`)
    
    redirect("/");
}
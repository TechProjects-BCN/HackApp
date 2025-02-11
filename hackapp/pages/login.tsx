"use client";

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation';
import { signup } from '@/app/actions/auth'


import "./phone.css";

export default function login() {
    const router = useRouter()
    
    return (
        <div className="h-dvh">
            <form action={signup} className="h-screen w-screen flex flex-wrap flex-col ">
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
                    <h1>Hackathon 2026 App</h1>
                </div>
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh] text-black">
                    <input type="username" name="username" placeholder="Username" required />
                </div>
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh] text-black">
                    <input type="password" name="password" placeholder="Password" required />
                </div>
                <div className="flex flex-col items-center justify-center">
                    <button type="submit" className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[3vh] bg-gray-600`}>
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

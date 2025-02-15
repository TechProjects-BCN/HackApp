"use client";

import { Poppins } from 'next/font/google';
import { login } from '@/app/actions/auth'
import { useActionState } from 'react';
import { cn } from '@/app/lib/utils';
import "@/app/phone.css";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400"]
})


export default function LoginRoute() {
    const [state, action, pending] = useActionState(login, undefined)
    return (
        <div className="h-dvh">
            <form action={action} className="h-screen w-screen flex flex-wrap flex-col ">
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
                    <h1>Hackathon 2026 App</h1>
                </div>
                <div className={`flex items-center justify-center w-screen mt-[5vh] text-[1.7vh] ${font.className}`}>
                    <h1>Login with the username</h1>
                </div>
                <div className={`flex items-center justify-center w-screen mt-[0.4vh] text-[1.7vh] ${font.className}`}>
                    <h1>and password given to your group</h1>
                </div>
                <div className={cn("flex items-center justify-center mt-[5vh] text-[2.5vh] text-black ${font.className}", font.className)}>
                    <input className='w-1/2 h-[5vh]' type="username" name="username" placeholder="Username" required />
                </div>
                <div className={cn("flex items-center justify-center mt-[5vh] text-[2.5vh] text-black ${font.className}", font.className)}>
                    <input autoComplete='on' className='w-1/2 h-[5vh]' type="password" name="password" placeholder="Password" required />
                </div>
                <div className={cn("flex items-center justify-center mt-[5vh] text-[2.5vh] text-white ${font.className}", font.className)}>
                    {state?.message && <p>{state.message}</p>}
                </div>
                <div className="flex flex-col items-center justify-center">
                    <button type="submit" className="w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[5vh] text-white hover:bg-gray-700 focus:ring-4 bg-gray-500 rounded-lg text-sm px-5 py-2.5 me-2 mb-2  focus:outline-none">
                        Login
                    </button>
                </div>
            </form>
        </div>
    );
}

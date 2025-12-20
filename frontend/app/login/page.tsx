"use client";

import { login } from '@/app/actions/auth'
import { useActionState } from 'react';
import { cn } from '@/app/lib/utils';
import Image from 'next/image';

export default function LoginRoute() {
    const [state, action, pending] = useActionState(login, undefined)
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                        Hack26
                    </h1>
                    <p className="text-slate-400 text-lg">Login to your account</p>
                </div>

                <form action={action} className="glass-card p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                            <input
                                className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all'
                                type="username"
                                name="username"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <input
                                autoComplete='on'
                                className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all'
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary w-full"
                        disabled={pending}
                    >
                        {pending ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
                    <div className="bg-white p-2 rounded-xl">
                        <Image
                            className="w-auto h-16"
                            src="/EdgertonCenter.png"
                            width={600}
                            height={400}
                            alt="MIT Edgerton Center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { login } from '@/app/actions/auth'
import { useActionState } from 'react';
import { cn } from '@/app/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginRoute() {
    const [state, action, pending] = useActionState(login, undefined)
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold tracking-tight text-gradient">
                        Hack26
                    </h1>
                    <p className="text-slate-400 text-lg">Login to your account</p>
                </div>

                <Card className="space-y-6">
                    <form action={action} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                                <Input
                                    type="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                                <Input
                                    autoComplete='on'
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

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={pending}
                        >
                            {pending ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </Card>

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

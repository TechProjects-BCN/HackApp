"use client";

import { useRouter } from 'next/navigation';

export default function Help() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        Help Center
                    </h1>
                    <p className="text-slate-400">
                        Assistance is on the way
                    </p>
                </div>

                <div className="glass-card p-8 space-y-6 text-center">
                    <p className="text-lg text-slate-300">
                        Please remain at your station or finding a mentor.
                    </p>
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        <span className="font-bold block mb-1">Mentor Station</span>
                        Room 3-133
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary w-full"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

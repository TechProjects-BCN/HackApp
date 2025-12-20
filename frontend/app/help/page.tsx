"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/config';

export default function Help() {
    const router = useRouter();
    const [inQueue, setInQueue] = useState(false);
    const [called, setCalled] = useState(false);
    const [loading, setLoading] = useState(true);

    // Poll for status changes
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, [inQueue]); // Depend on inQueue to detect changes? No, better use ref or functional update if needed, but here simple logic works

    const checkStatus = async () => {
        try {
            const res = await fetch(`${getBackendUrl()}/info`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                const currentlyInQueue = data.inAssistanceQueue || false;

                // If we were in queue and now we are not, and we didn't just load the page...
                // Actually we need a separate state to track "wasInQueue" to detect the edge
                // For simplicity: if local inQueue is true, and remote is false -> CALLED

                setInQueue(prevInQueue => {
                    if (prevInQueue && !currentlyInQueue) {
                        setCalled(true);
                        // Play sound or vibrate?
                        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                    }
                    return currentlyInQueue;
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const requestAssistance = async () => {
        setLoading(true);
        setCalled(false); // Reset called state
        try {
            const res = await fetch(`${getBackendUrl()}/queue/assistance/join`, {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                // Immediate check
                checkStatus();
            } else {
                alert("Failed to join queue");
            }
        } catch (e) {
            console.error(e);
            alert("Error");
        } finally {
            setLoading(false);
        }
    };

    const cancelAssistance = async () => {
        if (!confirm("Cancel your request?")) return;
        setLoading(true);
        try {
            await fetch(`${getBackendUrl()}/queue/assistance/cancel`, {
                method: "POST",
                credentials: "include"
            });
            checkStatus();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const dismissCalled = () => {
        setCalled(false);
        setInQueue(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        Materials & Help
                    </h1>
                    <p className="text-slate-400">
                        Request access to materials or a mentor
                    </p>
                </div>

                <div className="glass-card p-8 space-y-6 text-center">
                    {called ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/50">
                                <span className="text-4xl">✅</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-green-400 uppercase">You're Up!</h3>
                                <p className="text-white text-lg mt-2 font-bold">
                                    Please come to the Material Table.
                                </p>
                            </div>
                            <button
                                onClick={dismissCalled}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
                            >
                                I'm on my way
                            </button>
                        </div>
                    ) : inQueue ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-3xl">⏳</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-yellow-400">Waiting in Queue...</h3>
                                <p className="text-slate-300 mt-2">
                                    We will let you know when to come to the table.
                                </p>
                            </div>
                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                                <p className="text-xs text-yellow-200 font-bold uppercase tracking-wider animate-pulse">
                                    Do not close this window
                                </p>
                            </div>

                            <button
                                onClick={cancelAssistance}
                                disabled={loading}
                                className="text-sm text-red-400 hover:text-red-300 font-medium underline decoration-red-400/30 hover:decoration-red-400"
                            >
                                Cancel Request
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-lg text-slate-300">
                                Need materials or advice?
                            </p>
                            <button
                                onClick={requestAssistance}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Checking..." : "Request to Approach Table"}
                            </button>
                        </div>
                    )}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBackendUrl } from "../utils/config";

export default function AssistanceQueue() {
    const router = useRouter();
    const [queue, setQueue] = useState<any[]>([]);
    const [active, setActive] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/admin/users`, { credentials: "include" }); // Check if admin access works
                if (res.ok) {
                    setIsAdmin(true);
                    setLoading(false);
                } else {
                    router.push("/");
                }
            } catch (e) {
                router.push("/");
            }
        };
        checkAuth();
    }, [router]);

    // Data Fetching
    const fetchQueue = async () => {
        try {
            const res = await fetch(`${getBackendUrl()}/queue/assistance`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setQueue(data.queue || []);
                setActive(data.active || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!isAdmin) return;
        fetchQueue();
        const interval = setInterval(fetchQueue, 2000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    const popQueue = async (groupId?: number) => {
        try {
            await fetch(`${getBackendUrl()}/queue/assistance/pop`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId }),
                credentials: "include"
            });
            fetchQueue();
        } catch (e) {
            console.error(e);
        }
    };

    const removeGroup = async (groupId: number) => {
        if (!confirm("Remove this group?")) return;
        try {
            await fetch(`${getBackendUrl()}/queue/assistance/remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId }),
                credentials: "include"
            });
            fetchQueue();
        } catch (e) {
            console.error(e);
        }
    };

    const finishGroup = async (groupId: number) => {
        try {
            await fetch(`${getBackendUrl()}/queue/assistance/finish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId }),
                credentials: "include"
            });
            fetchQueue();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
    }

    const currentGroup = queue.length > 0 ? queue[0] : null;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
                                Assistance Queue
                            </h1>
                            <p className="text-slate-400 mt-2">Manage groups requesting help or materials</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-slate-200">{queue.length}</div>
                        <div className="text-xs uppercase text-slate-500 font-bold">Waiting</div>
                    </div>
                </div>

                {/* Main Action Area */}

                {/* Active / Currently Helping Section */}
                {active.length > 0 && (
                    <div className="glass-card p-6 border-l-4 border-green-500">
                        <h2 className="text-green-400 uppercase text-xs font-bold mb-4 tracking-widest">Currently at Table</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {active.map((group) => (
                                <div key={group.groupId} className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div>
                                        <div className="font-bold text-white text-lg">{group.name}</div>
                                        <div className="text-xs text-green-300 font-bold">Group #{group.groupNumber}</div>
                                        {group.message && (
                                            <div className="text-xs text-yellow-500/80 mt-1 italic">"{group.message}"</div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => finishGroup(group.groupId)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-sm transition-colors"
                                        >
                                            Finish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Next Up / Controls */}
                    <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <h2 className="text-slate-400 uppercase text-sm font-bold tracking-widest">Next Up</h2>

                        {currentGroup ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="text-6xl font-black text-white">{currentGroup.groupNumber}</div>
                                <div className="text-3xl font-bold text-yellow-400">{currentGroup.name}</div>
                                <div className="text-slate-400">{currentGroup.members || "No members listed"}</div>
                                {currentGroup.message && (
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg max-w-sm mx-auto">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Message</div>
                                        <div className="text-white italic">"{currentGroup.message}"</div>
                                    </div>
                                )}

                                <button
                                    onClick={() => popQueue()}
                                    className="mt-8 px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-2xl font-bold shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all w-full"
                                >
                                    CALL NEXT
                                </button>
                            </div>
                        ) : (
                            <div className="py-12">
                                <div className="text-2xl text-slate-600 font-bold">Queue Empty</div>
                                <p className="text-slate-600">No one is waiting for assistance</p>
                            </div>
                        )}
                    </div>

                    {/* Queue List */}
                    <div className="glass-card p-6 overflow-hidden flex flex-col">
                        <h3 className="text-slate-400 uppercase text-xs font-bold mb-4">Waiting List</h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {queue.map((group, i) => (
                                <div key={group.groupId || i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="font-mono text-slate-500 w-6 text-center">{i + 1}</div>
                                        <div>
                                            <div className="font-bold text-white leading-tight">{group.name}</div>
                                            <div className="text-xs text-slate-400">Group #{group.groupNumber}</div>
                                            {group.message && (
                                                <div className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{group.message}"</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => popQueue(group.groupId)}
                                            className="text-xs font-bold text-green-400 px-3 py-1 bg-green-500/10 rounded hover:bg-green-500/20 mr-2"
                                        >
                                            CALL
                                        </button>
                                        <button
                                            onClick={() => removeGroup(group.groupId)}
                                            className="text-xs font-bold text-red-500 px-3 py-1 bg-red-500/10 rounded hover:bg-red-500/20"
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {queue.length === 0 && (
                                <div className="text-center py-8 text-slate-600 italic">
                                    List is empty
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

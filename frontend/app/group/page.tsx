"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { getBackendUrl } from "../utils/config";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";

export default function Group() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/info`, { credentials: "include" });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-slate-500">Loading...</div>;
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-slate-500">
                <div className="text-center">
                    <p className="mb-4">Failed to load group info</p>
                    <button onClick={() => router.push("/")} className="btn-secondary">Go Home</button>
                </div>
            </div>
        );
    }

    const membersList = data.members ? data.members.split(',').map((m: string) => m.trim()).filter((m: string) => m) : [];



    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">
                        {t('groupInfo')}
                    </h1>
                    <p className="text-slate-400">
                        {t('manageTeam')}
                    </p>
                </div>

                <div className="glass-card p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">{t('groupName')}</label>
                            <div className="text-xl text-white font-medium">{data.name}</div>
                            <div className="text-sm text-slate-400">Group #{data.groupNumber}</div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">{t('username')}</label>
                            <div className="text-lg text-white font-mono">{data.username || "N/A"}</div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-1">{t('members')}</label>
                            <div className="text-base text-slate-300">
                                {membersList.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {membersList.map((m: string, i: number) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="italic text-slate-500">{t('noMembers')}</span>
                                )}
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <label className="block text-xs uppercase text-slate-500 font-bold mb-2">{t('settings')}</label>
                            <div className="bg-black/20 rounded-lg p-3">
                                <LanguageSelector />
                            </div>
                        </div>
                    </div>


                </div>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary w-full"
                >
                    {t('goBack')}
                </button>
            </div>
        </div>
    );
}

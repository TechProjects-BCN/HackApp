"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function Tutorial() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-6">
            <button
                onClick={() => router.push("/")}
                className="self-start text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors"
            >
                <span>←</span> {t('back')}
            </button>

            <div className="max-w-2xl mx-auto w-full space-y-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                    {t('tutorialTitle')}
                </h1>

                <div className="space-y-6">
                    <section className="glass-card p-6 space-y-2">
                        <h2 className="text-xl font-bold text-white">1. {t('hotglue')} / {t('cutter')}</h2>
                        <p className="text-slate-400">
                            Select a queue to join. Wait for your turn. When a station becomes available and you are next, your screen will turn green and tell you which station to go to (e.g., Station #2).
                        </p>
                    </section>

                    <section className="glass-card p-6 space-y-2">
                        <h2 className="text-xl font-bold text-white">2. At the Station</h2>
                        <p className="text-slate-400">
                            Once at the station, "Accept" your spot on the screen to start the timer. You have a limited time (e.g., 10 minutes).
                        </p>
                    </section>

                    <section className="glass-card p-6 space-y-2">
                        <h2 className="text-xl font-bold text-white">3. Leaving</h2>
                        <p className="text-slate-400">
                            When you are done or the time is up (screen flashes red), click "Finish & Leave" to free the station for the next group.
                        </p>
                    </section>
                    <section className="glass-card p-6 space-y-2">
                        <h2 className="text-xl font-bold text-white">4. {t('assistance')}</h2>
                        <p className="text-slate-400">
                            If you need materials or mentorship, use the Assistance Queue. An admin will call you to the table.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function Tutorial() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col p-6 font-sans">
            <button
                onClick={() => router.push("/")}
                className="self-start text-slate-400 hover:text-white flex items-center gap-2 mb-8 transition-colors border border-white/5 bg-white/5 rounded-full px-4 py-2 text-sm font-bold"
            >
                <span>←</span> {t('back')}
            </button>

            <div className="max-w-3xl mx-auto w-full space-y-12 animate-fade-in pb-20">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
                        {t('tutorialCompGuide')}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                        {t('tutorialSubtitle')}
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Section 1: The Queues */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{t('tutorialSharedStations')}</h2>
                        </div>

                        <div className="glass-card p-6 md:p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        1. {t('tutorialJoinQueue')}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t('tutorialJoinQueueDesc')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        2. {t('tutorialWait')}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {t('tutorialWaitDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t('tutorialProTip')}</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {t('tutorialProTipDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: At the Station */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-orange-400 mb-2">
                            <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{t('tutorialAtStation')}</h2>
                        </div>

                        <div className="glass-card p-6 md:p-8 space-y-4">
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">1</span>
                                    <div>
                                        <h4 className="font-bold text-white">{t('tutorialTapAccept')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('tutorialTapAcceptDesc')}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">2</span>
                                    <div>
                                        <h4 className="font-bold text-white">{t('tutorialWatchTimer')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('tutorialWatchTimerDesc')}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">3</span>
                                    <div>
                                        <h4 className="font-bold text-white">{t('tutorialFinish')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('tutorialFinishDesc')}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3: Assistance & Resources */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-yellow-400 mb-2">
                                <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">{t('tutorialNeedHelp')}</h2>
                            </div>
                            <div className="glass-card p-6 h-full">
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    {t('tutorialNeedHelpDesc1')}
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {t('tutorialNeedHelpDesc2')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-purple-400 mb-2">
                                <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">{t('tutorialAlerts')}</h2>
                            </div>
                            <div className="glass-card p-6 h-full">
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                    {t('tutorialAlertsDesc1')}
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {t('tutorialAlertsDesc2')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <footer className="pt-8 border-t border-white/5 text-center px-4">
                        <p className="text-slate-500 italic text-sm">
                            "{t('tutorialFooter')}"
                        </p>
                    </footer>

                </div>
            </div>
        </div>
    );
}

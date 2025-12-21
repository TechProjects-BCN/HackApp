"use client";

import { useState, useEffect } from "react";
import { getBackendUrl } from "../app/utils/config";
import { useLanguage } from "../app/context/LanguageContext";

export default function AlertSystem() {
    const { t } = useLanguage();
    const [currentAlert, setCurrentAlert] = useState<any | null>(null);
    const [dismissedThisSession, setDismissedThisSession] = useState<number[]>([]);

    const fetchAlerts = async () => {
        try {
            const res = await fetch(`${getBackendUrl()}/alerts`);
            if (res.ok) {
                const data = await res.json();
                const activeAlerts = data.alerts || [];

                const dismissed = JSON.parse(localStorage.getItem("dismissedAlerts") || "[]");

                // Filter alerts
                const toShow = activeAlerts.filter((a: any) => {
                    if (a.type === "persistent") {
                        // Show unless dismissed this PAGE LOAD
                        return !dismissedThisSession.includes(a.id);
                    }
                    // Show onetime if not permanently dismissed
                    return !dismissed.includes(a.id);
                });

                if (toShow.length > 0) {
                    setCurrentAlert(toShow[0]);
                } else {
                    setCurrentAlert(null);
                }
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [dismissedThisSession]); // Re-run when dismissal updates

    const dismiss = () => {
        if (!currentAlert) return;

        if (currentAlert.type === "onetime") {
            const dismissed = JSON.parse(localStorage.getItem("dismissedAlerts") || "[]");
            if (!dismissed.includes(currentAlert.id)) {
                dismissed.push(currentAlert.id);
                localStorage.setItem("dismissedAlerts", JSON.stringify(dismissed));
            }
        } else {
            // Persistent: Dismiss for this refresh cycle only
            setDismissedThisSession(prev => [...prev, currentAlert.id]);
        }

        setCurrentAlert(null);
        // Fetch again shortly to see if there are others in queue?
        setTimeout(fetchAlerts, 500);
    };

    if (!currentAlert) return null;

    // Design Config based on Severity
    const getSeverityStyles = (s: string) => {
        switch (s) {
            case 'warning': return {
                container: 'border-orange-500/50 from-orange-500/10 to-transparent',
                iconBg: 'bg-orange-500',
                text: 'text-orange-400',
                icon: '⚠️'
            };
            case 'announcement': return {
                container: 'border-purple-500/50 from-purple-500/10 to-transparent',
                iconBg: 'bg-purple-500',
                text: 'text-purple-400',
                icon: '📢'
            };
            default: return {
                container: 'border-blue-500/50 from-blue-500/10 to-transparent',
                iconBg: 'bg-blue-500',
                text: 'text-blue-400',
                icon: 'ℹ️'
            };
        }
    }

    const style = getSeverityStyles(currentAlert.severity || 'info');

    return (
        <div className="fixed bottom-6 left-0 right-0 p-4 z-[100] flex justify-center pointer-events-none">
            <div className={`pointer-events-auto max-w-lg w-full backdrop-blur-xl bg-black/80 border ${style.container} bg-gradient-to-r shadow-2xl rounded-2xl flex items-start p-5 gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300`}>
                <div className={`text-xl ${style.iconBg} text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    {style.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className={`font-bold uppercase tracking-wider text-[10px] ${style.text} mb-0.5`}>
                        {t('alert_' + (currentAlert.severity || 'info').toLowerCase())}
                    </div>
                    <div className="text-white font-medium leading-normal text-sm md:text-base">
                        {currentAlert.message}
                    </div>
                </div>

                <button
                    onClick={dismiss}
                    className="text-slate-400 hover:text-white transition-colors p-1 -mr-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

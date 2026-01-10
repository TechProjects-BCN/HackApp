"use client";


import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { getBackendUrl } from "../../utils/config";
import { useLanguage } from '../../context/LanguageContext';


import { playNotificationSound } from "../../utils/audio"; // Adjust path as needed



export default function Queue() {
    const router = useRouter();
    // Queue State
    const [groups_in_front, setGroupsInFront] = useState(0);
    const [estimated_time_remaining, setEstimatedTimeRemaining] = useState(0);

    // Spot State
    const [spotToAccept, setSpotToAccept] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(30);

    const { t } = useLanguage();
    const params = useParams();
    const queueType = params.queueType;

    const leaveQueue = async (queueType: any) => {
        await fetch(`${getBackendUrl()}/removequeue`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ "queueType": queueType }),
            credentials: "include",
        });
        router.push(`/`);
    };

    const acceptSpot = async () => {
        await fetch(`${getBackendUrl()}/accept`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ "spotType": queueType }),
            credentials: "include",
        });
        router.push(`/inside/${queueType}`);
    };

    const giveUpSpot = async () => {
        await fetch(`${getBackendUrl()}/giveupspot`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ "spotType": queueType }),
            credentials: "include",
        });
        // Reset local state to show queue again (or redirect home if that's the logic, usually give up means leave)
        setSpotToAccept(null);
    };

    const checkQueueStatus = async () => {
        try {
            var response = await fetch(`${getBackendUrl()}/status`, {
                headers: { "Content-Type": "application/json" },
                method: "GET",
                credentials: "include"
            });
            var data = await response.json();
            console.log("Queue Update:", data);

            if (data[`spot${queueType}ToAccept`]) {
                const spotData = data[`spot${queueType}ToAccept`];
                setSpotToAccept(spotData);
                playNotificationSound();

                // Sync countdown if backend provides it, otherwise basic logic
                // The original spot page calculated based on local time vs target, 
                // but we can just simplify or try to infer. 
                // For now, we just keep the loop playing sound.

            } else if (data[`${queueType}Station`]) {
                router.push(`/inside/${queueType}`);

            } else if (data[`${queueType}Queue`]) {
                const currentPos = data[`${queueType}Queue`]["position"];

                // Play sound if we are at position 1 (persistent reminder)
                if (currentPos === 1) {
                    console.log("Position 1 - Playing Sound");
                    playNotificationSound();
                }

                setGroupsInFront(currentPos);
                setEstimatedTimeRemaining(data[`${queueType}Queue`]["ETA"]);
                setSpotToAccept(null); // Ensure we go back to queue view if functionality changes
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Queue check failed", error);
        }
    };

    useEffect(() => {
        checkQueueStatus(); // Initial check
        const interval = setInterval(checkQueueStatus, 4000);

        // Timer for the spot countdown (visual only)
        const timerInterval = setInterval(() => {
            if (spotToAccept) {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            } else {
                setTimeLeft(30);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, [spotToAccept]); // Re-bind if spot status changes to ensure timer logic works

    const queue_propieties = {
        "queueName": t('hotglue'),
        "queueIdName": queueType
    }
    if (queueType == "cutter") {
        queue_propieties["queueName"] = t('cutter');
    }

    // --- RENDER SPOT ACCEPTANCE UI ---
    if (spotToAccept) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-900 via-green-950 to-black">
                <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="text-center space-y-4">
                        <div className="inline-block p-3 rounded-full bg-green-500/20 text-green-400 mb-4 ring-1 ring-green-500/30">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-white">
                            {t('spotAvailable')}
                        </h1>
                        <p className="text-green-200/80 text-lg">
                            {t('proceedTo')} {queue_propieties["queueName"]} {t('station')}
                        </p>
                    </div>

                    <div className="glass-card p-8 text-center border-green-500/30 bg-green-900/10">
                        <div className="text-sm text-green-300 uppercase tracking-wider font-semibold mb-2">{t('stationNum')}</div>
                        <div className="text-7xl font-bold text-white tracking-tighter mb-6">
                            {spotToAccept.spotId || "-"}
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-300 font-mono text-xl border border-green-500/20">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeLeft}s {t('remaining')}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={acceptSpot}
                            className="w-full relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-green-500/40 active:scale-[0.98]"
                        >
                            {t('imHere')}
                        </button>

                        <button
                            type="button"
                            onClick={giveUpSpot}
                            className="w-full px-8 py-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm"
                        >
                            {t('giveUpSpot')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER QUEUE WAITING UI ---
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                        {queue_propieties["queueName"]}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        {t('liveStatus')}
                    </div>
                </div>

                <div className="glass-card p-8 space-y-6 text-center">
                    <div className="space-y-1">
                        <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{t('groupsAhead')}</div>
                        <div className="text-6xl font-bold text-white tracking-tighter">
                            {groups_in_front}
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    <div className="space-y-1">
                        <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{t('estWaitTime')}</div>
                        <div className="text-2xl font-bold text-blue-400">
                            ~{estimated_time_remaining} {t('min')}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => leaveQueue(queueType)}
                    className="btn-danger w-full"
                >
                    {t('leaveQueue')}
                </button>
            </div>
        </div>
    );
}

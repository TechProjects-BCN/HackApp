"use client";


import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { getBackendUrl } from "../../utils/config";
import { useLanguage } from "../../context/LanguageContext";


export default function Spot() {
    const router = useRouter();
    const { t } = useLanguage();
    const params = useParams(); // Gets dynamic params from the URL
    const spotType = params.spotType;
    const TimeNow = Math.floor(Date.now() / 1000);
    const [targetEpoch, settargetEpoch] = useState(60 * 10 + 30 + TimeNow);
    const [timeLeft, setTimeLeft] = useState(60 * 10 + 30);
    const [spotNumber, setSpotNumber] = useState("-");
    const spot_propietes = {
        "spotName": t('hotglue'),
        "spotIdName": spotType
    };
    if (spotType == "cutter") {
        spot_propietes["spotName"] = t('cutter');
    }
    const LeaveSpot = async (spotType: any) => {
        await fetch(`${getBackendUrl()}/leavespot`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ "spotType": spotType }),
            credentials: "include",
        });
        router.push(`/`);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                var response = await fetch(`${getBackendUrl()}/status`, {
                    headers: { "Content-Type": "application/json" },
                    method: "GET",
                    credentials: "include"
                });
                var result = await response.json();
                return result;
            } catch (error) {
                return {};
            }
        }
        const interval = setInterval(async () => {
            setTimeLeft(targetEpoch - (Math.floor(Date.now() / 1000)));
            console.log(targetEpoch);
            var data = await fetchData();
            console.log(data);
            if (data[`spot${spotType}ToAccept`]) {
                router.push(`/spot/${spotType}`);
            } else if (data[`${spotType}Station`]) {
                setSpotNumber(data[`${spotType}Station`]["spotId"]);
                settargetEpoch(data[`${spotType}Station`]["EpochEnd"]);
            } else if (data[`${spotType}Queue`]) {
                router.push(`/queue/${spotType}`);
            } else {
                router.push("/");
            }
        }, 1000);

        // Separate timer for local countdown
        const timerInterval = setInterval(() => {
            const left = targetEpoch - Math.floor(Date.now() / 1000);
            setTimeLeft(left);

            if (left <= 0) {
                // Time is up! Kick them out.
                LeaveSpot(spot_propietes["spotIdName"]);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, [targetEpoch]);

    const secs = Math.floor(timeLeft % 60);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-1000 ${timeLeft < 60 ? "animate-flash-red" : "bg-gradient-to-br from-blue-900 via-slate-900 to-black"}`}>
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white">
                        {t('inProgress')}
                    </h1>
                    <p className="text-blue-200/80">
                        {t('using')} {spot_propietes["spotName"]}
                    </p>
                </div>

                <div className="glass-card p-8 text-center bg-blue-500/5 border-blue-500/20">
                    <div className="inline-block p-4 rounded-full bg-blue-500/10 mb-4">
                        <span className="text-4xl">🛠️</span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="text-sm text-blue-300 uppercase tracking-wider font-semibold">{t('currentStation')}</div>
                            <div className="text-5xl font-bold text-white mt-1">
                                #{spotNumber}
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div>
                            <div className="text-sm text-blue-300 uppercase tracking-wider font-semibold">{t('timeRemaining')}</div>
                            <div className="text-3xl font-mono font-bold text-blue-400 mt-1">
                                {minutes}:{secs < 10 ? `0${secs}` : secs}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => LeaveSpot(spot_propietes["spotIdName"])}
                    className="btn-danger w-full"
                >
                    {t('finishLeave')}
                </button>
            </div>
        </div>
    );
}

"use client";


import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { getBackendUrl } from "../../utils/config";
import { useLanguage } from '../../context/LanguageContext';


export default function Spot() {
    const router = useRouter();
    const { t } = useLanguage();
    const TimeNow = Math.floor(Date.now() / 1000);
    const targetEpoch = 30;
    const params = useParams(); // Gets dynamic params from the URL
    const spotType = params.spotType;
    const [timeLeft, setTimeLeft] = useState(targetEpoch);
    const [spotNumber, setSpotNumber] = useState("-");
    const spot_propietes = {
        "spotName": t('hotglue'),
        "spotIdName": spotType
    }
    if (spotType == "cutter") {
        spot_propietes["spotName"] = t('cutter');
    }

    async function AcceptSpot(request: any) {
        await fetch(`${getBackendUrl()}/accept`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ "spotType": spotType }),
            credentials: "include",
        });
        router.push(`/inside/${spotType}`);
    }

    async function GiveUpSpot(request: any) {
        await fetch(`${getBackendUrl()}/giveupspot`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ "spotType": spotType }),
            credentials: "include",
        });
        router.push(`/queue/${spotType}`);
    }
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
            setTimeLeft(targetEpoch - (Math.floor(Date.now() / 1000) - TimeNow));

            var data = await fetchData();
            console.log(data);
            if (data[`spot${spotType}ToAccept`]) {
                setSpotNumber(data[`spot${spotType}ToAccept`]["spotId"])
            } else if (data[`${spotType}Station`]) {
                router.push(`/inside/${spotType}`);
            } else if (data[`${spotType}Queue`]) {
                router.push(`/queue/${spotType}`);
            } else {
                router.push("/");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetEpoch]);

    const secs = timeLeft % 60;
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
                        {t('proceedTo')} {spot_propietes["spotName"]} {t('station')}
                    </p>
                </div>

                <div className="glass-card p-8 text-center border-green-500/30 bg-green-900/10">
                    <div className="text-sm text-green-300 uppercase tracking-wider font-semibold mb-2">{t('stationNum')}</div>
                    <div className="text-7xl font-bold text-white tracking-tighter mb-6">
                        {spotNumber}
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-300 font-mono text-xl border border-green-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {secs}s {t('remaining')}
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => AcceptSpot(spot_propietes["spotIdName"])}
                        className="w-full relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-green-500/40 active:scale-[0.98]"
                    >
                        {t('imHere')}
                    </button>

                    <button
                        type="button"
                        onClick={() => GiveUpSpot(spot_propietes["spotIdName"])}
                        className="w-full px-8 py-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm"
                    >
                        {t('giveUpSpot')}
                    </button>
                </div>
            </div>
        </div>
    );
}

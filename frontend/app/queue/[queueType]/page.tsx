"use client";


import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { getBackendUrl } from "../../utils/config";
import { useLanguage } from '../../context/LanguageContext';


export default function Queue() {
    const router = useRouter();
    var [groups_in_front, setGroupsInFront] = useState(0);
    var [estimated_time_remaining, setEstimatedTimeRemaining] = useState(0);
    const { t } = useLanguage();
    const params = useParams(); // Gets dynamic params from the URL
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
            var data = await fetchData();
            console.log(data);
            if (data[`spot${queueType}ToAccept`]) {
                router.push(`/spot/${queueType}`);

            } else if (data[`${queueType}Station`]) {
                router.push(`/inside/${queueType}`);

            } else if (data[`${queueType}Queue`]) {
                setGroupsInFront(data[`${queueType}Queue`]["position"]);
                setEstimatedTimeRemaining(data[`${queueType}Queue`]["ETA"]);
            } else {
                router.push("/");
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [groups_in_front]);



    const queue_propieties = {
        "queueName": t('hotglue'),
        "queueIdName": queueType
    }
    if (queueType == "cutter") {
        queue_propieties["queueName"] = t('cutter');
    }
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

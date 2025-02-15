"use client";

import "@/app/phone.css";
import { useState, useEffect } from "react";
import { leaveQueue } from "@/app/actions/queue";

export default function Queue() {
    var [groups_in_front, setGroupsInFront] = useState(0);
    var [estimated_time_remaining, setEstimatedTimeRemaining] = useState(0);
    const queue_propieties = {
        "queueName": "Hot Glue",
        "queueIdName": "hotglue"
    }
    return (
        <div className="h-dvh">
            <form className="h-screen w-screen flex flex-wrap flex-col ">
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
                    <h1>Hackathon 2026 App</h1>
                </div>
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[13vh] text-[3.5vh] text-center">
                    <h1 className="w-[70vw]">You are in the {queue_propieties["queueName"]} Queue</h1>
                </div>
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[8vh] text-[2.0vh] text-center">
                    <h1 className="w-[70vw]">You have {groups_in_front} groups in front of you</h1>
                </div>
                <div className="flex items-center justify-center w-screen h-[5vh] mt-[0.5vh] text-[2.0vh] text-center">
                    <h1 className="w-[70vw]">Estimated Time Remaining: {estimated_time_remaining} min</h1>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <button type="button" onClick={() => leaveQueue(queue_propieties["queueIdName"])} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[7.2vh] bg-red-600`}>
                        Leave Queue
                    </button>
                </div>
            </form>
        </div>
    );
}

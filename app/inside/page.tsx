"use client";

import "@/app/phone.css";
import { useState, useEffect } from "react";
import { LeaveSpot } from "@/app/actions/queue";


export default function Spot() {
    const IP = "";
    var [groups_in_front, setGroupsInFront] = useState(0);
    var [estimated_time_remaining, setEstimatedTimeRemaining] = useState(0);
    const TimeNow = Math.floor(Date.now() / 1000);
    const targetEpoch = 60 * 10 + 30;
    const [timeLeft, setTimeLeft] = useState(targetEpoch);
    const spot_propietes = {
        "spotName": "Hot Glue",
        "spotIdName": "hotglue",
        "spotNumber": 2
    }
    useEffect(() => {
        const interval = setInterval(() => {
          setTimeLeft(targetEpoch - (Math.floor(Date.now() / 1000) - TimeNow));
        }, 1000);
    
        return () => clearInterval(interval);
      }, [targetEpoch]);

    const secs = timeLeft % 60;
    const minutes = Math.floor((timeLeft % 3600) / 60);

    return (
    <div className="h-dvh">
        <div className="h-screen w-screen flex flex-wrap flex-col ">
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
                <h1>Hackathon 2026 App</h1>
            </div>
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[13vh] text-[3.5vh] text-center">
                <h1 className="w-[70vw]">You are in station number {spot_propietes["spotNumber"]} in {spot_propietes["spotName"]}</h1>
            </div>
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[8vh] text-[3.0vh] text-center">
                <h1 className="w-[70vw]">{minutes}min {secs} seconds left</h1>
            </div>
            <div className="flex flex-col items-center justify-center">
                <button type="button" onClick={() => LeaveSpot(spot_propietes["spotIdName"])} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[4.2vh] bg-red-600`}>
                    Leave Spot
                </button>
            </div>
        </div>
    </div>
    );
}

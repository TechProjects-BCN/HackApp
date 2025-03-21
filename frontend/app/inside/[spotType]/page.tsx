"use client";

import "@/app/phone.css";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';


export default function Spot() {
    const router = useRouter();
    const params = useParams(); // Gets dynamic params from the URL
    const spotType = params.spotType;
    const TimeNow = Math.floor(Date.now() / 1000);
    const [targetEpoch, settargetEpoch] = useState(60 * 10 + 30 + TimeNow);
    const [timeLeft, setTimeLeft] = useState(60 * 10 + 30);
    const [spotNumber, setSpotNumber] = useState("-");
    const spot_propietes = {
        "spotName": "Hot Glue",
        "spotIdName": spotType
    };
    if (spotType == "cutter")
    {
        spot_propietes["spotName"] = "Box Cutter";
    }
    const LeaveSpot = async (spotType: any) => {
        await fetch(`http://${process.env.NEXT_PUBLIC_BKG_HOST}/leavespot`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({"spotType": spotType}),
                credentials: "include",
          });
          router.push(`/`);
      };
      useEffect(() => {
        const fetchData = async () => {
          try {
            var response = await fetch(`http://${process.env.NEXT_PUBLIC_BKG_HOST}/status`, {
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
            if (data[`spot${spotType}ToAccept`]){
                router.push(`/spot/${spotType}`);
            } else if (data[`${spotType}Station`]){
                setSpotNumber(data[`${spotType}Station`]["spotId"]);
                settargetEpoch(data[`${spotType}Station`]["EpochEnd"]);
            } else if (data[`${spotType}Queue`]){
                router.push(`/queue/${spotType}`);
            } else{
                router.push("/");
            }
        }, 1000);
    
        return () => clearInterval(interval);
      }, [targetEpoch]);

    const secs = Math.floor(timeLeft % 60);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    return (
    <div className="h-dvh">
        <div className="h-screen w-screen flex flex-wrap flex-col ">
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
                <h1>Hackathon 2026 App</h1>
            </div>
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[13vh] text-[3.5vh] text-center">
                <h1 className="w-[70vw]">You are in station number {spotNumber} in {spot_propietes["spotName"]}</h1>
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

"use client";

import "@/app/phone.css";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';


export default function Spot() {
    const router = useRouter();
    const TimeNow = Math.floor(Date.now() / 1000);
    const targetEpoch = 30;
    const params = useParams(); // Gets dynamic params from the URL
    const spotType = params.spotType;
    const [timeLeft, setTimeLeft] = useState(targetEpoch);
    const [spotNumber, setSpotNumber] = useState(-1);
    const spot_propietes = {
        "spotName": "Hot Glue",
        "spotIdName": spotType
    }
    if (spotType == "cutter")
    {
        spot_propietes["spotName"] = "Box Cutter";
    }
    
    async function AcceptSpot(request: any) {
        await fetch(`http://${process.env.NEXT_PUBLIC_BKG_HOST}/accept`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({"spotType": spotType}),
            credentials: "include",
        });
        router.push(`/inside/${spotType}`);
    }

    async function GiveUpSpot(request: any) {
        await fetch(`http://${process.env.NEXT_PUBLIC_BKG_HOST}/giveupspot`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({"spotType": spotType}),
            credentials: "include",
        });        
        router.push(`/queue/${spotType}`);
    }
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
            setTimeLeft(targetEpoch - (Math.floor(Date.now() / 1000) - TimeNow));

          var data = await fetchData();
            console.log(data);
            if (data[`spot${spotType}ToAccept`]){
                setSpotNumber(data[`spot${spotType}ToAccept`]["spotId"])
            } else if (data[`${spotType}Station`]){
                router.push(`/inside/${spotType}`);
            } else if (data[`${spotType}Queue`]){
                router.push(`/queue/${spotType}`);
            } else{
                router.push("/");
            }
        }, 1000);
    
        return () => clearInterval(interval);
      }, [targetEpoch]);

    const secs = timeLeft % 60;
    return (
    <div className="h-dvh bg-[#006B10]">
        <div className="h-screen w-screen flex flex-wrap flex-col ">
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
                <h1>Hackathon 2026 App</h1>
            </div>
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[13vh] text-[3.5vh] text-center">
                <h1 className="w-[70vw]">You have a spot in {spot_propietes["spotName"]} Station number {spotNumber} !!</h1>
            </div>
            <div className="flex items-center justify-center w-screen h-[5vh] mt-[8vh] text-[3.0vh] text-center">
                <h1 className="w-[70vw]">{secs} seconds left</h1>
            </div>
            <div className="flex flex-col items-center justify-center">
                <button type="button" onClick={() => AcceptSpot(spot_propietes["spotIdName"])} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[7.2vh] bg-[#73B600]`}>
                    Take Spot
                </button>
            </div>
            <div className="flex flex-col items-center justify-center">
                <button type="button" onClick={() => GiveUpSpot(spot_propietes["spotIdName"])} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[4.2vh] bg-red-600`}>
                    Give Up Spot
                </button>
            </div>
        </div>
    </div>
    );
}

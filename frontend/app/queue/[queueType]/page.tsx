"use client";

import "@/app/phone.css";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';


export default function Queue() {
    const router = useRouter();
    var [groups_in_front, setGroupsInFront] = useState(0);
    var [estimated_time_remaining, setEstimatedTimeRemaining] = useState(0);
    const params = useParams(); // Gets dynamic params from the URL
    const queueType = params.queueType;
    const leaveQueue = async (queueType: any) => {
        await fetch(`http://${process.env.NEXT_PUBLIC_BKG_HOST}/removequeue`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({"queueType": queueType}),
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
          var data = await fetchData();
            console.log(data);
            if (data["spotHotGlueToAccept"] || data["spotHotGlueToAccept"]){
                router.push(`/spot/${queueType}`);
            };
            if (data["hotglueStation"] && queueType == "hotglue"){
                router.push(`/inside/hotglue`);
            };
            if (data["cutterStation"] && queueType == "cutter"){
                router.push(`/inside/cutter`);
            };
            if (data["hotglueQueue"] && queueType == "hotglue"){
                setGroupsInFront(data["hotglueQueue"]["position"]);
                setEstimatedTimeRemaining(data["hotglueQueue"]["ETA"]);
                queue_propieties["queueName"] = "Hot Glue"
            }
            if (data["cutterQueue"] && queueType == "cutter"){
                setGroupsInFront(data["cutterQueue"]["position"]);
                setEstimatedTimeRemaining(data["cutterQueue"]["ETA"]);
            }
        }, 1000);
    
        return () => clearInterval(interval);
      }, [groups_in_front]);
      
    const queue_propieties = {
        "queueName": "Hot Glue",
        "queueIdName": queueType
    } 
    if (queueType == "cutter")
    {
        queue_propieties["queueName"] = "Box Cutter";
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
                    <button type="button" onClick={() => leaveQueue(queueType)} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[7.2vh] bg-red-600`}>
                        Leave Queue
                    </button>
                </div>
            </form>
        </div>
    );
}

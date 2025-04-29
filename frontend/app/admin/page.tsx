"use client";

import { useState, useEffect } from "react";
import "./style.css";

const NUMBER_OF_CUTTING_STATIONS = 4;
const NUMBER_OF_HOT_GLUE_STATIONS = 5;

const QUEUE_IP = `http://${process.env.NEXT_PUBLIC_BKG_HOST}/queue`;
const COUNTDOWN_IP = `http://${process.env.NEXT_PUBLIC_BKG_HOST}/countdown`;

export default function Screen() {

  var targetEpoch = 1745939420;
  
  // Update Variables
  useEffect(() => {
    const fetchData = async (IP: string) => {
      try {
        var response = await fetch(IP);
        var result = await response.json();
        return result;
      } catch (error) {
        return {};
      }
    }
    const interval = setInterval(async () => {

    }, 1000);

    return () => clearInterval(interval);
  }, [targetEpoch]);

  return (
    <div className="flex">
      <div className="w-3/5 h-screen bg-white" >
        <h1 className="text-[2.5vw] text-center font-bold mt-[2.5vw]">
          Admin Panel
        </h1>
        <div className="w-full h-3/5 mt-8">

        </div>
      </div>
      <div className="w-1/5 h-screen border-l-[0.2vw] border-black bg-gray-400">
        <div className="w-full h-[2.8vw] text-[1.7vw] font-bold mt-[1.8vw] text-center">
            Cutting Stations
        </div>
        {Array.from({ length: NUMBER_OF_CUTTING_STATIONS }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <div className={`w-3/4 h-[4.5vw] text-[1.4vw] flex items-center justify-center mt-[2.2vw] bg-gray-600`}>
              Nº{index + 1} {}
          </div>
        </div>
        ))}
      </div>
      <div className="w-1/5 h-screen border-l-[0.2vw] border-black bg-gray-400">
        <div className="w-full h-[2.8vw] text-[1.7vw] font-bold mt-[1.8vw] text-center">
            Hot Glue Stations
        </div>
        {Array.from({ length: NUMBER_OF_HOT_GLUE_STATIONS }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <div className={`w-3/4 h-[4.5vw] text-[1.4vw] flex items-center justify-center mt-[2.2vw] bg-gray-600`}>
              Nº{index + 1} {}
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}

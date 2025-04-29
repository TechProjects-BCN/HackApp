"use client";

import { useState, useEffect } from "react";
import "./style.css";

const NUMBER_OF_CUTTING_STATIONS = 4;
const NUMBER_OF_HOT_GLUE_STATIONS = 5;

const QUEUE_IP = `http://${process.env.NEXT_PUBLIC_BKG_HOST}/queue`;
const COUNTDOWN_IP = `http://${process.env.NEXT_PUBLIC_BKG_HOST}/countdown`;

export default function Screen() {
  var [event, setEvent] = useState("Lunch");
  var [sign, setSign] = useState("-");
  var color_options = ["text-green-600", "text-red-600", "text-pink-600"];
  var [cut, setCut] = useState<string[]>(["AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE"]);
  var [hot, setHot] = useState<string[]>(["AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE"]);
  var cutting_colors = Array.from({length: NUMBER_OF_CUTTING_STATIONS}, () => "text-green-600");
  var hotGlue_colors = Array.from({length: NUMBER_OF_HOT_GLUE_STATIONS}, () => "text-green-600");
  var [cut_colors, setCut_colors] = useState(cutting_colors);
  var [hotglue_colors, setHotGlue_colors] = useState(hotGlue_colors);
  var cutting_status = [0, 1, 0, 0];
  var hotGlue_status = [0, 1, 0, 0, 2];
  var targetEpoch = 1745939420;
  const [timeLeft, setTimeLeft] = useState(targetEpoch - Math.floor(Date.now() / 1000));
  
  const StateToAvail = (state: number[], colors: string[], number_of_stations: number) =>
  {
    var temp = [];
    for (var s = 0; s < number_of_stations; s++)
    {
      if (state[s] == 0)
        {
          colors[s] = color_options[0];
          temp[s] = "AVAILABLE";
        }
        else if (state[s] == 2)
        {
          colors[s] = color_options[2];
          temp[s] = "UNAVAILABLE";
        }
        else
        {
          colors[s] = color_options[1];
          temp[s] = "OCCUPIED";
        }
    }
    return temp
  }
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
      var queue_data = await fetchData(QUEUE_IP);
      var countdown_data = await fetchData(COUNTDOWN_IP);
      cutting_status = queue_data["cutter_stations"];
      hotGlue_status = queue_data["hot_glue_stations"];
      setEvent(countdown_data["event"]);
      setCut(StateToAvail(cutting_status, cutting_colors, NUMBER_OF_CUTTING_STATIONS));
      setCut_colors(cutting_colors);
        
      setHot(StateToAvail(hotGlue_status, hotGlue_colors, NUMBER_OF_HOT_GLUE_STATIONS));
      setHotGlue_colors(hotGlue_colors);
      targetEpoch = countdown_data["target_epoch"];
      if (targetEpoch > Math.floor(Date.now() / 1000))
      {
        setTimeLeft(targetEpoch - Math.floor(Date.now() / 1000));
        setSign("-");
      } else{
        setTimeLeft(Math.floor(Date.now() / 1000) - targetEpoch);
        setSign("+");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetEpoch]);
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex">
      <div className="w-3/5 h-screen bg-white" >
        <h1 className="text-[2.5vw] text-center font-bold mt-[2.5vw]">
          MIT&CIC&UPC Hackathon 2026
        </h1>
        <div className="text-[1.5vw] text-center font-bold mt-[2vw]">
          Time Until {event}: 
        </div>
        <div className="text-[4vw] text-center font-bold">
          T {sign} {hours}:{minutes}:{secs}
        </div>
        <div className="w-full h-3/5 mt-8">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/xX4mBbJjdYM"
          title="YouTube Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        </div>
      </div>
      <div className="w-1/5 h-screen border-l-[0.2vw] border-black bg-gray-400">
        <div className="w-full h-[2.8vw] text-[1.7vw] font-bold mt-[1.8vw] text-center">
            Cutting Stations
        </div>
        {Array.from({ length: NUMBER_OF_CUTTING_STATIONS }).map((_, index) => (
        <div key={index} className="flex flex-col items-center justify-center">
          <div className={`w-3/4 h-[4.5vw] text-[1.4vw] flex items-center justify-center mt-[2.2vw] bg-gray-600 ${cut_colors[index]}`}>
              Nº{index + 1} {cut[index]}
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
          <div className={`w-3/4 h-[4.5vw] text-[1.4vw] flex items-center justify-center mt-[2.2vw] bg-gray-600 ${hotglue_colors[index]}`}>
              Nº{index + 1} {hot[index]}
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}

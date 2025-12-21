"use client";

import { useState, useEffect, useRef } from "react";
import { getBackendUrl } from "../utils/config";
import StationSidebar from "../components/StationSidebar";

export default function Screen() {
  const [nextEvent, setNextEvent] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [sign, setSign] = useState("-");
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [cut, setCut] = useState<any[]>([]);
  const [hot, setHot] = useState<any[]>([]);
  const targetEpochRef = useRef(1745939420);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState({
    app_title: "Hack26",
    app_subtitle: "MIT • CIC • UPC"
  });

  useEffect(() => {
    const fetchData = async (IP: string) => {
      try {
        const response = await fetch(IP);
        const result = await response.json();
        return result;
      } catch (error) {
        return {};
      }
    }

    const updateData = async () => {
      const queue_data = await fetchData(`${getBackendUrl()}/queue`);
      const countdown_data = await fetchData(`${getBackendUrl()}/countdown`);

      // Keys updated to match backend refactor: cutter_stations and hotglue_stations
      const current_cutter_status = queue_data["cutter_stations"] || [];
      const current_hot_status = queue_data["hotglue_stations"] || [];

      setNextEvent(countdown_data["next_event"] || countdown_data["event"]);
      setCurrentEvent(countdown_data["current_event"] || "Networking");
      setYoutubeId(countdown_data["youtube_id"] || "xX4mBbJjdYM");

      setCut(current_cutter_status);
      setHot(current_hot_status);

      setConfig({
        app_title: countdown_data["app_title"] || "Hack26",
        app_subtitle: countdown_data["app_subtitle"] || "MIT • CIC • UPC"
      });

      if (countdown_data["target_epoch"]) {
        targetEpochRef.current = countdown_data["target_epoch"];
      }
      setLoading(false);
    };

    updateData(); // Run immediately
    const fetchInterval = setInterval(updateData, 1000);

    // Separate countdown timer
    const listTimer = setInterval(() => {
      const target = targetEpochRef.current;
      const now = Math.floor(Date.now() / 1000);
      if (target > now) {
        setTimeLeft(target - now);
        setSign("-");
      } else {
        setTimeLeft(now - target);
        setSign("+");
      }
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(listTimer);
    };
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-500 font-mono">Loading Dashboard...</div>
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans p-4 gap-4 relative">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-50 ml-4 bg-white p-2 rounded-xl shadow-lg">
        <img
          src="/EdgertonCenter.png"
          alt="MIT Edgerton Center"
          className="h-12 md:h-16 object-contain"
        />
      </div>

      {/* Main Content */}
      <div className="w-3/5 flex flex-col gap-4 overflow-hidden">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            {config.app_subtitle}
          </h1>
          <div className="text-xl text-slate-400 font-medium tracking-wide">
            {config.app_title}
          </div>
        </div>

        <div className="glass-card flex-1 p-4 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-1">
              <div className="text-2xl text-white font-bold uppercase tracking-widest mb-4">
                Current Event: <span className="text-blue-400">{currentEvent}</span>
              </div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-widest">
                Next Event: {nextEvent}
              </div>
              <div className="text-7xl font-bold font-mono text-white tabular-nums tracking-tighter">
                T{sign} {hours}:{minutes < 10 ? `0${minutes}` : minutes}:{secs < 10 ? `0${secs}` : secs}
              </div>
            </div>

            <div className="w-[90%] aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Cutting Stations Sidebar */}
      <StationSidebar title="Box Cutter" stations={cut} />

      {/* Hot Glue Stations Sidebar */}
      <StationSidebar title="Hot Glue" stations={hot} />
    </div>
  );
}

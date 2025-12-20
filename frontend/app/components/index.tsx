"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logout } from '@/app/actions/auth';
import Image from 'next/image';
import { getBackendUrl } from '../utils/config';

export default function Index() {
  const [groupName, setGroupName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`${getBackendUrl()}/info`, { credentials: "include" }).then(res => {
      if (res.status === 200) {
        res.json().then(data => {
          setGroupName(data.name);
          setIsAdmin(data.isAdmin || false);
        })
      }
    })
  }, [])

  const joinQueue = async (queueType: string) => {
    await fetch(`${getBackendUrl()}/joinqueue`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ "queueType": queueType }),
      credentials: "include",
    });
    router.push(`/queue/${queueType}`);
  };
  const router = useRouter();

  return (
    <div className="h-dvh flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            Hack26
          </h1>
          <p className="text-slate-400 text-base">MIT • CIC • UPC</p>
        </div>

        <div className="glass-card p-6 space-y-3">


          {/* Admin Controls */}
          {isAdmin && (
            <div className="space-y-2 pb-2 border-b border-white/5">
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/screen")}
                  className="flex-1 btn-secondary py-2 text-xs font-bold rounded-lg"
                >
                  Open Screen
                </button>
                <button
                  onClick={() => router.push("/admin")}
                  className="flex-1 btn-secondary py-2 text-xs font-bold rounded-lg"
                >
                  Admin Dashboard
                </button>
              </div>
              <button
                onClick={() => router.push("/assistance")}
                className="w-full btn-secondary py-2 text-xs font-bold rounded-lg bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
              >
                Assistance Queue
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => joinQueue("hotglue")}
            className="btn-primary w-full group py-3"
          >
            <span className="flex items-center justify-center gap-2">
              Hot Glue Queue
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>

          <button
            type="button"
            onClick={() => joinQueue("cutter")}
            className="btn-primary w-full group py-3"
          >
            <span className="flex items-center justify-center gap-2">
              Box Cutter Queue
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/help')}
            className="btn-secondary w-full py-2"
          >
            Need assistance?
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium border border-red-500/10 text-sm"
          >
            Log Out
          </button>

          <button
            type="button"
            onClick={() => router.push('/group')}
            className="btn-secondary px-0 text-sm py-2"
          >
            {groupName}
          </button>
        </div>

        <div className="flex justify-center pt-4 opacity-50 hover:opacity-100 transition-opacity">
          <div className="bg-white p-2 rounded-xl">
            <Image
              className="w-auto h-12"
              src="/EdgertonCenter.png"
              width={800}
              height={600}
              alt="MIT Edgerton Center Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

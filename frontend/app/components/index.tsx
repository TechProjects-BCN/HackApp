"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logout } from '@/app/actions/auth';
import Image from 'next/image';
import { getBackendUrl } from '../utils/config';
import { useLanguage } from '../context/LanguageContext';

export default function Index() {
  const [groupName, setGroupName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useLanguage();
  const [config, setConfig] = useState({
    app_title: "",
    app_subtitle: ""
  });

  useEffect(() => {
    fetch(`${getBackendUrl()}/info`, { credentials: "include" }).then(res => {
      if (res.status === 200) {
        res.json().then(data => {
          setGroupName(data.name);
          setIsAdmin(data.isAdmin || false);
        })
      }
    });

    fetch(`${getBackendUrl()}/countdown`).then(res => {
      if (res.ok) {
        res.json().then(data => {
          setConfig({
            app_title: data.app_title || "",
            app_subtitle: data.app_subtitle || ""
          });
        });
      }
    });
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
            {config.app_title || t('title')}
          </h1>
          <p className="text-slate-400 text-base">{config.app_subtitle || t('subtitle')}</p>
          {groupName && (
            <p className="text-lg font-medium text-white pt-2 animate-fade-in">
              {t('welcome')} <span className="text-blue-400">{groupName}</span>!
            </p>
          )}
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
                  {t('screen')}
                </button>
                <button
                  onClick={() => router.push("/admin")}
                  className="flex-1 btn-secondary py-2 text-xs font-bold rounded-lg"
                >
                  {t('admin')}
                </button>
              </div>
              <button
                onClick={() => router.push("/assistance")}
                className="w-full btn-secondary py-2 text-xs font-bold rounded-lg bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
              >
                {t('assistanceQueue')}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => joinQueue("hotglue")}
            className="btn-primary w-full group py-3"
          >
            <span className="flex items-center justify-center gap-2">
              {t('hotglue')}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>

          <button
            type="button"
            onClick={() => joinQueue("cutter")}
            className="btn-primary w-full group py-3"
          >
            <span className="flex items-center justify-center gap-2">
              {t('cutter')}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/help')}
            className="btn-secondary w-full py-2"
          >
            {t('assistance')}
          </button>

          <button
            type="button"
            onClick={() => router.push('/tutorial')}
            className="btn-secondary w-full py-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
          >
            {t('tutorial')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium border border-red-500/10 text-sm"
          >
            {t('logout')}
          </button>

          <button
            type="button"
            onClick={() => router.push('/group')}
            className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
          >
            {groupName}
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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

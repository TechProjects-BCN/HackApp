"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logout } from '@/app/actions/auth';
import Image from 'next/image';
import { getBackendUrl } from '../utils/config';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Index() {
  const [groupName, setGroupName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useLanguage();
  const [config, setConfig] = useState({
    app_title: "",
    app_subtitle: ""
  });
  const [links, setLinks] = useState<any[]>([]);
  const [showResources, setShowResources] = useState(false);

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

    fetch(`${getBackendUrl()}/links`).then(res => {
      if (res.ok) {
        res.json().then(data => {
          setLinks(data.links || []);
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
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">
            {config.app_title || t('title')}
          </h1>
          <p className="text-slate-400 text-base">{config.app_subtitle || t('subtitle')}</p>
          {groupName && (
            <p className="text-lg font-medium text-white pt-2 animate-fade-in">
              {t('welcome')} <span className="text-blue-400">{groupName}</span>!
            </p>
          )}
        </div>

        <Card className="space-y-3 p-6">


          {/* Admin Controls */}
          {isAdmin && (
            <div className="space-y-2 pb-2 border-b border-white/5">
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/screen")}
                  variant="secondary"
                  className="flex-1 py-2 text-xs font-bold rounded-lg"
                >
                  {t('screen')}
                </Button>
                <Button
                  onClick={() => router.push("/admin")}
                  variant="secondary"
                  className="flex-1 py-2 text-xs font-bold rounded-lg"
                >
                  {t('admin')}
                </Button>
              </div>
              <Button
                onClick={() => router.push("/assistance")}
                variant="secondary"
                className="w-full py-2 text-xs font-bold rounded-lg bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
              >
                {t('assistanceQueue')}
              </Button>
            </div>
          )}

          <Button
            type="button"
            onClick={() => joinQueue("hotglue")}
            className="w-full group py-3"
          >
            <span className="flex items-center justify-center gap-2">
              {t('hotglue')}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </Button>

          <Button
            type="button"
            onClick={() => joinQueue("cutter")}
            className="w-full group py-3"
          >
            <span className="flex items-center justify-center gap-2">
              {t('cutter')}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </Button>

          <Button
            type="button"
            onClick={() => router.push('/help')}
            variant="secondary"
            className="w-full py-2"
          >
            {t('assistance')}
          </Button>

          <Button
            type="button"
            onClick={() => router.push('/tutorial')}
            variant="secondary"
            className="w-full py-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300"
          >
            {t('tutorial')}
          </Button>

          {links.length > 0 && (
            <Button
              type="button"
              onClick={() => setShowResources(true)}
              variant="secondary"
              className="w-full py-2 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300"
            >
              {t('resources')}
            </Button>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium border border-red-500/10 text-sm"
          >
            {t('logout')}
          </button>

          <Button
            type="button"
            onClick={() => router.push('/group')}
            variant="secondary"
            className="text-sm py-2 flex items-center justify-center gap-2"
          >
            {groupName}
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </Button>
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


      {/* Resources Modal */}
      {
        showResources && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowResources(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-white mb-6">{t('resources')}</h2>

              <div className="space-y-3">
                {links.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">{link.title}</span>
                      <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

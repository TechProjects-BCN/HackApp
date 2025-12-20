"use client";

import { useLanguage } from "../context/LanguageContext";
import { Language } from "../utils/translations";

export default function LanguageSelector() {
    const { language, setLanguage, t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium ml-1">{t('selectLanguage')}</label>
            <select
                value={language}
                onChange={handleChange}
                className="bg-slate-900 border border-white/10 text-slate-300 text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500/50 outline-none"
            >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ca">Català</option>
                <option value="it">Italiano</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
            </select>
        </div>
    );
}

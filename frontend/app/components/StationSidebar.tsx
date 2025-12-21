import { useLanguage } from '../../context/LanguageContext';

export default function StationSidebar({ title, stations }: { title: string, stations: any[] }) {
    return (
        <div className="w-1/5 flex flex-col gap-2 overflow-hidden">
            <div className="glass-card p-2 text-center">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">{title}</h2>
            </div>
            <div className="flex-1 flex flex-col gap-2 min-h-0">
                {stations.map((item, index) => (
                    <div key={index} className="glass-card flex-1 px-3 flex flex-row items-center justify-between gap-1 min-h-0">
                        <div className="flex flex-col justify-center">
                            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider leading-none mb-0.5">Station</div>
                            <div className={`text-2xl font-bold leading-none ${item === 0 ? "text-green-400" :
                                item === 2 ? "text-slate-600" : "text-red-400"
                                }`}>
                                #{index + 1}
                            </div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-md text-center truncate max-w-[60%] ${item === 0 ? "bg-green-500/10 text-green-400" :
                            item === 2 ? "bg-slate-500/10 text-slate-500" : "bg-red-500/10 text-red-400"
                            }`}>
                            {item === 0 ? "AVAILABLE" : item === 2 ? "UNAVAILABLE" : (typeof item === 'object' ? (item as any).name : "OCCUPIED")}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

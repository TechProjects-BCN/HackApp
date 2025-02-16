"use client";

import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import Image from 'next/image';
import "@/app/phone.css";

export default function Index() {

  const joinQueue = async (queueType: string) => {
    await fetch(`http://${process.env.NEXT_PUBLIC_BKG_HOST}/queue`, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({"queueType": queueType}),
            credentials: "include",
      });
      router.push(`/queue/${queueType}`);
  };
  const router = useRouter();
  var project_name = "Fountain";

  return (
    <div className="h-dvh">
    <div className="h-[53vh] w-screen flex flex-wrap flex-col ">
      <div className="flex items-center justify-center w-screen h-[5vh] mt-[5vh] text-[4.5vh]">
          <h1>Hackathon 2026 App</h1>
      </div>
      <div className="flex flex-col items-center justify-center">
          <button type="button" onClick={() => joinQueue("hotglue")} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[7.2vh] bg-gray-600`}>
              Enter Hot Glue Queue
          </button>
      </div>
      <div className="flex flex-col items-center justify-center">
          <button type="button" onClick={() => joinQueue("cutter")} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[3vh] bg-gray-600`}>
              Enter Box Cutter Queue
          </button>
      </div>
      <div className="flex flex-col items-center justify-center">
          <button type="button" onClick={() => router.push('/help')} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[3vh] bg-gray-600`}>
              Ask for Help
          </button>
      </div>
    </div>
    <div className="h-[37vh] w-screen flex flex-wrap flex-col">
      <div className="flex flex-col items-center justify-center">
          <button type="button" onClick={() => logout()} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[3vh] bg-gray-600`}>
              Log Out
          </button>
      </div>
      <div className="flex flex-col items-center justify-center">
          <button type="button" onClick={() => router.push('/group')} className={`w-1/2 h-[6.5vh] text-[2.2vh] flex items-center justify-center mt-[3vh] bg-gray-600`}>
              Group: {project_name}
          </button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Image className="w-auto h-[15vh] mt-[2vh]"
          src="/TP.png"
          width={600}
          height={400}
          alt="TechProjects Logo"
        />
      </div>
    </div>
    </div>
  );
}

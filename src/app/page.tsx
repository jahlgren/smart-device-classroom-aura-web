"use client";

import DevicesBlock from "@/components/blocks/devices-block";
import { showCreateDeviceModal } from "@/components/modals/create-device-modal";
import Container from "@/components/ui/container";

export default function Home() {
  
  const handleDeiveAddClick = () => {
    showCreateDeviceModal();
  }

  return (
    <div className="m-4 sm:m-6">
      <Container className="space-y-4">
        <header className="border-b border-slate-400 py-4">
          <h1 className="text-3xl font-bold text-slate-800">Classroom Aura</h1>
        </header>
        
        <button onClick={handleDeiveAddClick} className="align-center flex w-full cursor-pointer justify-center rounded border-2 border-dashed border-slate-200 p-4 text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600">
          Add New Device
        </button>

        <DevicesBlock />
      </Container>
    </div>
  );
}

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { EmergencyProvider } from './context/EmergencyContext';
import { UnifiedStage } from './components/screens/UnifiedStage';
import { SplashScreen } from './components/screens/SplashScreen';
import { MedicalIDModal } from './components/modals/MedicalIDModal';
import { ContactsModal } from './components/modals/ContactsModal';
import { CPRModal } from './components/modals/CPRModal';

import { CursorGlow } from './components/common/CursorGlow';

export function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <CursorGlow />
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      <EmergencyProvider>
        <div className="min-h-screen bg-[#03050F] text-slate-100 font-sans antialiased selection:bg-brand-accent/30 selection:text-brand-accent overflow-x-hidden">
          <UnifiedStage />
          {/* Modals */}
          <MedicalIDModal />
          <ContactsModal />
          <CPRModal />
        </div>
      </EmergencyProvider>
    </>
  );
}

export default App;

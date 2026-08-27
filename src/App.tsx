import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { EmergencyProvider } from './context/EmergencyContext';
import { IncidentProvider } from './context/IncidentContext';
import { AuthProvider } from './context/AuthContext';
import { UnifiedStage } from './components/screens/UnifiedStage';
import { SplashScreen } from './components/screens/SplashScreen';
import { MedicalIDModal } from './components/modals/MedicalIDModal';
import { ContactsModal } from './components/modals/ContactsModal';
import { CPRModal } from './components/modals/CPRModal';

export function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      <AuthProvider>
        <EmergencyProvider>
          <IncidentProvider>
            <div className="min-h-screen bg-[#020304] text-slate-100 font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-200 overflow-x-hidden">
              <UnifiedStage />
              {/* Modals */}
              <MedicalIDModal />
              <ContactsModal />
              <CPRModal />
            </div>
          </IncidentProvider>
        </EmergencyProvider>
      </AuthProvider>
    </>
  );
}

export default App;

import React from 'react';
import { ICONS } from '../constants';
import { FormSchema } from '../types';
import RecentFormList from './RecentFormList';
import { useStore } from '../store/useStore'; // Import the store
import MissionControl from './MissionControl'; // Import the new MissionControl component
import { getThemeColor } from '../utils/themeUtils';

interface DashboardProps {
  onGenerate: (prompt: string) => Promise<void>;
  onManualCreate: () => void;
  onSelectForm: (form: FormSchema) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerate, onManualCreate, onSelectForm }) => {
  // Get state and actions from the Zustand store
  const forms = useStore(state => state.forms);
  const deleteForm = useStore(state => state.deleteForm);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Subtle scanline effect for futuristic feel */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="scanline"></div>
      </div>

      <div className="max-w-4xl w-full text-center space-y-8 md:space-y-12 z-10 mt-8 md:mt-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-tight">
            Kuestionnaire.ai
          </h1>
          <p className="text-base md:text-xl text-slate-400 font-light max-w-2xl mx-auto px-4">
            The futuristic way to collect data. Describe your form, and our AI will build it in seconds.
          </p>
        </div>

        <MissionControl 
            onGenerate={onGenerate}
            onManualCreate={onManualCreate}
        />

        {/* Recent Forms Section */}
        {forms.length > 0 && (
          <div className="w-full text-left pt-12 animate-in slide-in-from-bottom-10 duration-700">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest font-display">Recent Transmissions</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
             </div>
             
             <RecentFormList 
               forms={forms}
               onSelectForm={onSelectForm}
               onDeleteForm={deleteForm} 
               getThemeColor={getThemeColor}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import api from './services/api';
import { GlucoseReading, Meal, Medication, LogEntry as LogEntryType, UserMedication, WeightReading, BloodPressureReading } from './types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Dashboard from '../components/Dashboard';
import ActivityPage from '../components/ActivityPage';
import HistoryPage from '../components/HistoryPage';
import SettingsPage from '../components/SettingsPage';
import GlucoseLogModal from '../components/GlucoseLogModal';
import MealLogModal from '../components/MealLogModal';
import MedicationLogModal from '../components/MedicationLogModal';
import MyMedicationsModal from '../components/MyMedicationsModal';
import BottomNavBar from '../components/BottomNavBar';
import { PlusIcon } from '../components/Icons';
// import { initialGlucoseReadings, initialMeals, initialMedications, initialUserMedications } from './components/dummyData';
import WeightLogModal from '../components/WeightLogModal';
import BloodPressureLogModal from '../components/BloodPressureLogModal';
import ActionBottomSheet from '../components/ActionBottomSheet';

export type Page = 'dashboard' | 'activity' | 'history' | 'settings';

const MainApp: React.FC = () => {
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [weightReadings, setWeightReadings] = useState<WeightReading[]>([]);
  const [bloodPressureReadings, setBloodPressureReadings] = useState<BloodPressureReading[]>([]);
  const [userMedications, setUserMedications] = useState<UserMedication[]>([]);
  
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isBloodPressureModalOpen, setIsBloodPressureModalOpen] = useState(false);
  const [isMyMedicationsModalOpen, setIsMyMedicationsModalOpen] = useState(false);

  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mmol/L');
  const [activePage, setActivePage] = useState<Page>('dashboard');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('🔄 Fetching initial data...');
        const [glucoseRes, mealsRes, medicationsRes, weightRes, bloodPressureRes, userMedicationsRes] = await Promise.all([
          api.get('/logs/glucose'),
          api.get('/logs/meals'),
          api.get('/logs/medications'),
          api.get('/logs/weight'),
          api.get('/logs/blood-pressure'),
          api.get('/medications')
        ]);

        console.log('📊 Initial data fetched:', {
          glucose: glucoseRes.data.length,
          meals: mealsRes.data.length,
          medications: medicationsRes.data.length,
          weight: weightRes.data.length,
          bloodPressure: bloodPressureRes.data.length,
          userMedications: userMedicationsRes.data.length
        });

        setGlucoseReadings(glucoseRes.data);
        setMeals(mealsRes.data);
        setMedications(medicationsRes.data);
        setWeightReadings(weightRes.data);
        setBloodPressureReadings(bloodPressureRes.data);
        setUserMedications(userMedicationsRes.data);
      } catch (error) {
        console.error('❌ Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const addGlucoseReading = useCallback(async (reading: Omit<GlucoseReading, 'id'>) => {
    try {
      console.log('📝 Adding glucose reading:', reading);
      const response = await api.post('/logs/glucose', reading);
      console.log('✅ Glucose reading added:', response.data);

      // Flatten the response data to match the GET endpoint structure
      const flattenedReading = {
        id: response.data.id,
        timestamp: response.data.timestamp,
        ...response.data.data
      };
      console.log('🔧 Flattened reading for state:', flattenedReading);

      setGlucoseReadings(prev => {
        const updated = [...prev, flattenedReading].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        console.log('📊 Updated glucose readings count:', updated.length);
        return updated;
      });
      console.log('✅ addGlucoseReading completed successfully');
    } catch (error) {
      console.error('❌ Failed to add glucose reading:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  }, []);

  const addMeal = useCallback(async (meal: Omit<Meal, 'id'>) => {
    try {
      console.log('🍽️ Adding meal:', meal);
      const response = await api.post('/logs/meals', meal);
      console.log('✅ Meal added:', response.data);
      setMeals(prev => {
        const updated = [...prev, response.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        console.log('📊 Updated meals count:', updated.length);
        return updated;
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to add meal:', error);
      return null;
    }
  }, []);

  const addMedication = useCallback(async (medication: Omit<Medication, 'id'>) => {
    try {
      console.log('💊 Adding medication:', medication);
      const response = await api.post('/logs/medications', medication);
      console.log('✅ Medication added:', response.data);

      // Handle data structure similar to glucose readings
      const flattenedMedication = {
        id: response.data.id,
        timestamp: response.data.timestamp,
        ...response.data.data
      };
      console.log('🔧 Flattened medication for state:', flattenedMedication);

      setMedications(prev => {
        const updated = [...prev, flattenedMedication].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        console.log('📊 Updated medications count:', updated.length);
        return updated;
      });
      console.log('✅ addMedication completed successfully');
    } catch (error) {
      console.error('❌ Failed to add medication:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  }, []);

  const addWeightReading = useCallback(async (reading: Omit<WeightReading, 'id'>) => {
    try {
      const response = await api.post('/logs/weight', reading);
      setWeightReadings(prev => [...prev, response.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Failed to add weight reading:', error);
    }
  }, []);

  const addBloodPressureReading = useCallback(async (reading: Omit<BloodPressureReading, 'id'>) => {
    try {
      const response = await api.post('/logs/blood-pressure', reading);
      setBloodPressureReadings(prev => [...prev, response.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Failed to add blood pressure reading:', error);
    }
  }, []);

  const saveUserMedication = useCallback(async (med: Omit<UserMedication, 'id'> & { id?: string }) => {
    try {
      if (med.id) {
        const response = await api.put(`/medications/${med.id}`, med);
        setUserMedications(prev => prev.map(m => m.id === med.id ? response.data : m));
      } else {
        const response = await api.post('/medications', med);
        setUserMedications(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Failed to save user medication:', error);
    }
  }, []);

  const deleteUserMedication = useCallback(async (id: string) => {
    try {
      await api.delete(`/medications/${id}`);
      setUserMedications(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete user medication:', error);
    }
  }, []);


  const combinedLogs: LogEntryType[] = useMemo(() => {
    return [
      ...glucoseReadings.map(r => ({ ...r, type: 'glucose' as const })),
      ...meals.map(m => ({ ...m, type: 'meal' as const })),
      ...medications.map(med => ({ ...med, type: 'medication' as const })),
      ...weightReadings.map(w => ({ ...w, type: 'weight' as const })),
      ...bloodPressureReadings.map(bp => ({ ...bp, type: 'blood_pressure' as const })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [glucoseReadings, meals, medications, weightReadings, bloodPressureReadings]);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard
                    glucoseReadings={glucoseReadings}
                    weightReadings={weightReadings}
                    bloodPressureReadings={bloodPressureReadings}
                    unit={glucoseUnit}
                />;
      case 'activity':
        return <ActivityPage logs={combinedLogs} />;
      case 'history':
        return <HistoryPage
                    onAddGlucose={addGlucoseReading}
                    onAddMeal={addMeal}
                    onAddMedication={addMedication}
                    onAddWeight={addWeightReading}
                    onAddBloodPressure={addBloodPressureReading}
                    userMedications={userMedications}
                    unit={glucoseUnit}
                />;
      case 'settings':
        return <SettingsPage
                    glucoseUnit={glucoseUnit}
                    onGlucoseUnitChange={setGlucoseUnit}
                    onOpenMyMedications={() => setIsMyMedicationsModalOpen(true)}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-light dark:bg-slate-900 text-text-primary dark:text-slate-100 font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 md:px-6 py-1.5 sm:py-4 overflow-hidden">
        {renderContent()}
      </main>

      <div className="fixed bottom-24 right-6">
        <button
          type="button"
          onClick={() => setIsActionSheetOpen(true)}
          className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-full p-4 shadow-fab hover:shadow-fab-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all transform hover:scale-105 duration-300"
          aria-label="Add new log"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>

      <Footer />
      <BottomNavBar activePage={activePage} onNavigate={setActivePage} />

      <ActionBottomSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onLogGlucose={() => {
          console.log('🔍 MainApp: Closing action sheet and opening glucose modal');
          setIsActionSheetOpen(false);
          setTimeout(() => {
            setIsGlucoseModalOpen(true);
          }, 100);
        }}
        onLogWeight={() => setIsWeightModalOpen(true)}
        onLogBloodPressure={() => setIsBloodPressureModalOpen(true)}
        onLogMeal={() => setIsMealModalOpen(true)}
        onLogMedication={() => setIsMedicationModalOpen(true)}
      />

      {isGlucoseModalOpen && (
        <GlucoseLogModal
          isOpen={isGlucoseModalOpen}
          onClose={() => setIsGlucoseModalOpen(false)}
          onAddReading={addGlucoseReading}
          unit={glucoseUnit}
        />
      )}
      {isMealModalOpen && (
        <MealLogModal
          isOpen={isMealModalOpen}
          onClose={() => setIsMealModalOpen(false)}
          onAddMeal={addMeal}
          onAddReading={addGlucoseReading}
          unit={glucoseUnit}
        />
      )}
      {isMedicationModalOpen && (
        <MedicationLogModal
          isOpen={isMedicationModalOpen}
          onClose={() => setIsMedicationModalOpen(false)}
          onAddMedication={addMedication}
          userMedications={userMedications}
        />
      )}
      {isWeightModalOpen && (
        <WeightLogModal
          isOpen={isWeightModalOpen}
          onClose={() => setIsWeightModalOpen(false)}
          onAddReading={addWeightReading}
        />
      )}
      {isBloodPressureModalOpen && (
        <BloodPressureLogModal
          isOpen={isBloodPressureModalOpen}
          onClose={() => setIsBloodPressureModalOpen(false)}
          onAddReading={addBloodPressureReading}
        />
      )}
      <MyMedicationsModal
        isOpen={isMyMedicationsModalOpen}
        onClose={() => setIsMyMedicationsModalOpen(false)}
        userMedications={userMedications}
        onSave={saveUserMedication}
        onDelete={deleteUserMedication}
      />
    </div>
  );
};

export default MainApp;
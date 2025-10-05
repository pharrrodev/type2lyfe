import React, { useState } from 'react';
import { GlucoseReading, Meal, Medication, WeightReading, BloodPressureReading } from '../types';
import { DownloadIcon } from './Icons';

interface ExportButtonProps {
  glucoseReadings: GlucoseReading[];
  meals: Meal[];
  medications: Medication[];
  weightReadings: WeightReading[];
  bloodPressureReadings: BloodPressureReading[];
}

const ExportButton: React.FC<ExportButtonProps> = ({
  glucoseReadings,
  meals,
  medications,
  weightReadings,
  bloodPressureReadings
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Create CSV content
      let csvContent = 'Type2Lyfe Health Data Export\n';
      csvContent += `Export Date: ${new Date().toLocaleString()}\n\n`;

      // Glucose Readings
      if (glucoseReadings.length > 0) {
        csvContent += 'GLUCOSE READINGS\n';
        csvContent += 'Timestamp,Value,Unit,Context,Source,Notes\n';
        glucoseReadings.forEach(reading => {
          csvContent += `${formatDate(reading.timestamp)},${reading.value},${reading.displayUnit},${reading.context || ''},${reading.source || ''},"${reading.notes || ''}"\n`;
        });
        csvContent += '\n';
      }

      // Weight Readings
      if (weightReadings.length > 0) {
        csvContent += 'WEIGHT READINGS\n';
        csvContent += 'Timestamp,Value,Unit,Notes\n';
        weightReadings.forEach(reading => {
          csvContent += `${formatDate(reading.timestamp)},${reading.value},${reading.displayUnit},"${reading.notes || ''}"\n`;
        });
        csvContent += '\n';
      }

      // Blood Pressure Readings
      if (bloodPressureReadings.length > 0) {
        csvContent += 'BLOOD PRESSURE READINGS\n';
        csvContent += 'Timestamp,Systolic,Diastolic,Pulse,Notes\n';
        bloodPressureReadings.forEach(reading => {
          csvContent += `${formatDate(reading.timestamp)},${reading.systolic},${reading.diastolic},${reading.pulse || ''},"${reading.notes || ''}"\n`;
        });
        csvContent += '\n';
      }

      // Meals
      if (meals.length > 0) {
        csvContent += 'MEALS\n';
        csvContent += 'Timestamp,Meal Type,Description,Calories,Carbs,Protein,Fat,Fiber,Source,Notes\n';
        meals.forEach(meal => {
          const nutrition = meal.nutrition || {};
          csvContent += `${formatDate(meal.timestamp)},${meal.mealType || ''},${meal.description || ''},${nutrition.calories || ''},${nutrition.carbs || ''},${nutrition.protein || ''},${nutrition.fat || ''},${nutrition.fiber || ''},${meal.source || ''},"${meal.notes || ''}"\n`;
        });
        csvContent += '\n';
      }

      // Medications
      if (medications.length > 0) {
        csvContent += 'MEDICATIONS\n';
        csvContent += 'Timestamp,Medication Name,Dosage,Notes\n';
        medications.forEach(med => {
          csvContent += `${formatDate(med.timestamp)},${med.medicationName || ''},${med.dosage || ''},"${med.notes || ''}"\n`;
        });
        csvContent += '\n';
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `type2lyfe-health-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalEntries = 
    glucoseReadings.length + 
    meals.length + 
    medications.length + 
    weightReadings.length + 
    bloodPressureReadings.length;

  if (totalEntries === 0) {
    return null;
  }

  return (
    <button
      onClick={exportToCSV}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export all health data to CSV"
    >
      <DownloadIcon className="w-5 h-5" />
      <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
    </button>
  );
};

export default ExportButton;


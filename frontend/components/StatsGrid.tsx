import React from 'react';
import { GlucoseReading, WeightReading, BloodPressureReading } from '../types';

interface StatsGridProps {
    readings: GlucoseReading[];
    weightReadings: WeightReading[];
    bloodPressureReadings: BloodPressureReading[];
    unit: 'mg/dL' | 'mmol/L';
}

const StatsGrid: React.FC<StatsGridProps> = ({ readings, weightReadings, bloodPressureReadings, unit }) => {
    const latestGlucose = readings.length > 0 ? readings[0] : null;
    const latestWeight = weightReadings.length > 0 ? weightReadings[0] : null;
    const latestBP = bloodPressureReadings.length > 0 ? bloodPressureReadings[0] : null;

    const get24HourAverage = () => {
        const now = new Date();
        const twentyFourHoursAgo = now.getTime() - (24 * 60 * 60 * 1000);
        const recentReadings = readings.filter(r => new Date(r.timestamp).getTime() > twentyFourHoursAgo);

        if (recentReadings.length === 0) return null;

        const sum = recentReadings.reduce((acc, curr) => acc + curr.value, 0);
        const average = sum / recentReadings.length;
        return unit === 'mmol/L' ? average.toFixed(1) : Math.round(average);
    };
    
    const average = get24HourAverage();

    return (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Latest Glucose Card */}
            <div className="bg-card dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center border border-border dark:border-slate-700">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1.5">Latest Glucose</p>
                {latestGlucose ? (
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-primary">
                        {latestGlucose.value}
                        <span className="text-xs sm:text-sm font-normal text-text-secondary dark:text-slate-400 ml-1">{unit}</span>
                    </p>
                ) : (
                    <p className="text-xl sm:text-2xl font-bold text-text-secondary dark:text-slate-600">-</p>
                )}
            </div>

            {/* 24h Average Card */}
            <div className="bg-card dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center border border-border dark:border-slate-700">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1.5">24h Average</p>
                {average ? (
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-primary">
                        {average}
                        <span className="text-xs sm:text-sm font-normal text-text-secondary dark:text-slate-400 ml-1">{unit}</span>
                    </p>
                ) : (
                    <p className="text-xl sm:text-2xl font-bold text-text-secondary dark:text-slate-600">-</p>
                )}
            </div>

            {/* Latest Weight Card */}
            <div className="bg-card dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center border border-border dark:border-slate-700">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1.5">Latest Weight</p>
                {latestWeight ? (
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-primary">
                        {latestWeight.value}
                        <span className="text-xs sm:text-sm font-normal text-text-secondary dark:text-slate-400 ml-1">{latestWeight.unit}</span>
                    </p>
                ) : (
                    <p className="text-xl sm:text-2xl font-bold text-text-secondary dark:text-slate-600">-</p>
                )}
            </div>

            {/* Latest Blood Pressure Card */}
            <div className="bg-card dark:bg-slate-800 p-3 sm:p-4 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 text-center border border-border dark:border-slate-700">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1.5">Latest BP</p>
                {latestBP ? (
                    <p className="text-xl sm:text-2xl font-bold text-primary dark:text-primary">
                        {latestBP.systolic}/{latestBP.diastolic}
                    </p>
                ) : (
                    <p className="text-xl sm:text-2xl font-bold text-text-secondary dark:text-slate-600">-</p>
                )}
            </div>
        </section>
    );
};

export default StatsGrid;
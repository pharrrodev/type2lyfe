import React from 'react';
import { FoodItem } from '../types';

interface NutritionDisplayProps {
  items: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
  };
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ items, total }) => {
  return (
    <div className="space-y-4">
      {/* Food Items List */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="bg-card dark:bg-slate-800 border-2 border-border dark:border-slate-700 rounded-2xl p-3 shadow-card">
            <div className="font-semibold text-text-primary dark:text-slate-100 mb-2">{item.name}</div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <div className="text-text-secondary dark:text-slate-400 mb-1 font-medium">Cal</div>
                <div className="font-bold text-text-primary dark:text-slate-100">{item.calories}</div>
              </div>
              <div className="text-center">
                <div className="text-text-secondary dark:text-slate-400 mb-1 font-medium">Protein</div>
                <div className="font-bold text-info">{item.protein}g</div>
              </div>
              <div className="text-center">
                <div className="text-text-secondary dark:text-slate-400 mb-1 font-medium">Carbs</div>
                <div className="font-bold text-warning">{item.carbs}g</div>
              </div>
              <div className="text-center">
                <div className="text-text-secondary dark:text-slate-400 mb-1 font-medium">Fat</div>
                <div className="font-bold text-primary">{item.fat}g</div>
              </div>
              <div className="text-center">
                <div className="text-text-secondary dark:text-slate-400 mb-1 font-medium">Sugar</div>
                <div className="font-bold text-danger">{item.sugar}g</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Nutrition - Prominent Display */}
      <div className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/30 dark:border-primary/40 rounded-2xl p-4 shadow-card">
        <div className="text-center mb-3">
          <h3 className="text-sm font-semibold text-text-secondary dark:text-slate-400 uppercase tracking-wide mb-1">Total Nutrition</h3>
          <div className="text-2xl font-bold text-primary">{total.calories}</div>
          <div className="text-sm text-text-secondary dark:text-slate-400 font-medium">calories</div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-card dark:bg-slate-800 rounded-lg p-3 text-center shadow-card border-2 border-border dark:border-slate-700">
            <div className="text-xs text-text-secondary dark:text-slate-400 mb-1 font-medium">Protein</div>
            <div className="text-xl font-bold text-info">{total.protein}</div>
            <div className="text-xs text-text-secondary dark:text-slate-400">grams</div>
          </div>
          <div className="bg-card dark:bg-slate-800 rounded-lg p-3 text-center shadow-card border-2 border-border dark:border-slate-700">
            <div className="text-xs text-text-secondary dark:text-slate-400 mb-1 font-medium">Carbs</div>
            <div className="text-xl font-bold text-warning">{total.carbs}</div>
            <div className="text-xs text-text-secondary dark:text-slate-400">grams</div>
          </div>
          <div className="bg-card dark:bg-slate-800 rounded-lg p-3 text-center shadow-card border-2 border-border dark:border-slate-700">
            <div className="text-xs text-text-secondary dark:text-slate-400 mb-1 font-medium">Fat</div>
            <div className="text-xl font-bold text-primary">{total.fat}</div>
            <div className="text-xs text-text-secondary dark:text-slate-400">grams</div>
          </div>
          <div className="bg-card dark:bg-slate-800 rounded-lg p-3 text-center shadow-card border-2 border-border dark:border-slate-700">
            <div className="text-xs text-text-secondary dark:text-slate-400 mb-1 font-medium">Sugar</div>
            <div className="text-xl font-bold text-danger">{total.sugar}</div>
            <div className="text-xs text-text-secondary dark:text-slate-400">grams</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDisplay;


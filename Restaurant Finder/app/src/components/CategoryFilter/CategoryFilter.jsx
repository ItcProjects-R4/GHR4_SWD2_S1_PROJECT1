import {
  UtensilsCrossed,
  Pizza,
  Fish,
  Croissant,
  Flame,
  Beef,
  Soup,
  ChefHat,
  Shrimp,
} from 'lucide-react';

const iconMap = {
  UtensilsCrossed,
  Pizza,
  Fish,
  Croissant,
  Flame,
  Beef,
  Soup,
  ChefHat,
  Shrimp,
};

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const IconComp = iconMap[cat.icon] || UtensilsCrossed;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            <IconComp className="w-4 h-4" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

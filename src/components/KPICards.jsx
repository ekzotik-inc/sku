import { useAppStore } from '../store/appStore';
import { Store, AlertTriangle, Package, Users, MapPin, User } from 'lucide-react';

export default function KPICards() {
  const { report } = useAppStore();
  if (!report) return null;

  const { stats } = report;
  const problemRate = stats.totalStores > 0
    ? Math.round((stats.problemStores / stats.totalStores) * 100)
    : 0;

  const cards = [
    {
      icon: Store,
      label: 'Торговых точек',
      value: stats.totalStores,
      sub: 'всего в отчёте',
      color: 'teal',
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      valueColor: 'text-teal-700',
    },
    {
      icon: AlertTriangle,
      label: 'Проблемных точек',
      value: stats.problemStores,
      sub: `${problemRate}% от общего числа`,
      color: 'red',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-700',
      highlight: stats.problemStores > 0,
    },
    {
      icon: Package,
      label: 'SKU к доставке',
      value: stats.totalSkuToDeliver,
      sub: 'позиций в дефиците',
      color: 'amber',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
    {
      icon: Users,
      label: 'BRE в отчёте',
      value: stats.totalBre,
      sub: 'менеджеров',
      color: 'violet',
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-700',
    },
    {
      icon: MapPin,
      label: 'Проблемный регион',
      value: stats.worstRegion,
      sub: 'наибольшее кол-во проблем',
      color: 'slate',
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-700',
      isText: true,
    },
    {
      icon: User,
      label: 'Проблемный BRE',
      value: stats.worstBre,
      sub: 'больше всего точек в дефиците',
      color: 'slate',
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-700',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`animate-fade-in-up bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover-lift ${card.highlight ? 'ring-2 ring-red-200' : ''}`}
            style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'forwards', opacity: 0 }}
          >
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
              <Icon size={17} className={card.iconColor} />
            </div>
            <div className={`font-bold mb-1 ${card.isText ? 'text-base leading-tight' : 'text-2xl'} ${card.valueColor} truncate`}>
              {card.value}
            </div>
            <div className="text-xs font-medium text-slate-700 mb-0.5">{card.label}</div>
            <div className="text-xs text-slate-400">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

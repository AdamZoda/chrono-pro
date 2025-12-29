
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  User as UserIcon,
  MapPin,
  X,
  Users,
  Filter,
  Timer
} from 'lucide-react';
import { ScheduleEvent } from '../types';

const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Génération des 24 créneaux horaires (1h par 1h)
const allSlots = Array.from({ length: 24 }, (_, i) => ({
  label: `${(i + 1).toString().padStart(2, '0')}H00`,
  value: i + 1,
  end: i + 2
}));

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { events, notes } = useAppContext();
  const navigate = useNavigate();

  const [zoomedEvent, setZoomedEvent] = useState<ScheduleEvent | null>(null);

  // Time Indicator & Countdown State
  const [now, setNow] = useState(new Date());
  const [nextEventText, setNextEventText] = useState<string>('');

  const daysMap = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const currentDayName = daysMap[now.getDay()];
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const progressPercent = (currentMinutes / 60) * 100;

  React.useEffect(() => {
    const updateTime = () => {
      const currentDate = new Date();
      setNow(currentDate);

      if (events.length === 0) {
        setNextEventText('');
        return;
      }

      const dayIndexMap: { [key: string]: number } = {
        'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
      };

      let nearestDist = Infinity;
      let nearestEvent: ScheduleEvent | null = null;
      let nearestDiffMs = 0;

      events.forEach(event => {
        const eventDayIndex = dayIndexMap[event.day];
        if (eventDayIndex === undefined) return;

        const targetDate = new Date(currentDate);
        targetDate.setHours(Math.floor(event.hour), 0, 0, 0);

        const currentDayIndex = currentDate.getDay();
        let dayDiff = eventDayIndex - currentDayIndex;

        if (dayDiff < 0) dayDiff += 7;

        targetDate.setDate(currentDate.getDate() + dayDiff);

        if (dayDiff === 0 && targetDate.getTime() <= currentDate.getTime()) {
          targetDate.setDate(targetDate.getDate() + 7);
        }

        const diffMs = targetDate.getTime() - currentDate.getTime();

        if (diffMs > 0 && diffMs < nearestDist) {
          nearestDist = diffMs;
          nearestEvent = event;
          nearestDiffMs = diffMs;
        }
      });

      if (nearestEvent) {
        const days = Math.floor(nearestDiffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((nearestDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((nearestDiffMs % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = '';
        if (days > 0) timeString += `${days}j `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        timeString += `${minutes}min`;

        setNextEventText(`Prochain : ${nearestEvent.title} dans ${timeString}`);
      } else {
        setNextEventText('');
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [events]);

  // Amplitude par défaut : 8h à 19h pour la lisibilité, modifiable de 1 à 24
  const [rangeStart, setRangeStart] = useState(8);
  const [rangeEnd, setRangeEnd] = useState(19);

  const getEventsForSlot = (day: string, hourValue: number) => {
    // On récupère l'événement si son heure de début tombe dans l'heure du créneau
    return events.filter(e => e.day === day && Math.floor(e.hour) === hourValue);
  };

  const visibleSlots = allSlots.filter(slot =>
    slot.value >= rangeStart && slot.value < rangeEnd
  );

  const today = weekDays[new Date().getDay() === 0 ? 4 : Math.min(new Date().getDay() - 1, 4)];
  const todayEvents = events.filter(e => e.day === today);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Statistique */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bonjour, {user?.firstName} 👋</h1>
          <p className="text-slate-500 font-medium text-sm">Vue 24h active • Aujourd'hui ({today})</p>
          {nextEventText && (
            <div className="mt-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 py-1 px-3 rounded-lg inline-flex items-center gap-2 animate-in slide-in-from-left duration-500">
              <Timer size={16} className="animate-pulse" />
              {nextEventText}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <Calendar size={18} />
            </div>
            <span className="text-sm font-bold text-slate-700">{events.length} Événements</span>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <FileText size={18} />
            </div>
            <span className="text-sm font-bold text-slate-700">{notes.length} Notes</span>
          </div>
        </div>
      </div>

      {/* Barre de Filtre d'Amplitude 24h */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter size={18} className="text-indigo-600" />
          <span className="text-sm font-bold uppercase tracking-tight">Amplitude (01H - 24H) :</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">DE</span>
            <select
              value={rangeStart}
              onChange={(e) => setRangeStart(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 23 }, (_, i) => i + 1).map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, '0')}H00</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">À</span>
            <select
              value={rangeEnd}
              onChange={(e) => setRangeEnd(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map(h => (
                <option key={h} value={h + 1}>{(h + 1).toString().padStart(2, '0')}H00</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-bold italic ml-auto hidden md:block uppercase tracking-wider">
          Scroll latéral actif si nécessaire →
        </p>
      </div>

      {/* Emploi du temps style Académique 24H */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter border-b-2 border-indigo-600 w-fit">
            Planning Hebdomadaire
          </h2>
          <button
            onClick={() => navigate('/schedule')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            Éditer <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto shadow-xl rounded-sm border-2 border-black bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-black">
                <th className="border-r-2 border-black p-4 w-28 bg-slate-100 shrink-0 sticky left-0 z-10">Jour</th>
                {visibleSlots.map(slot => (
                  <th key={slot.label} className="border-r-2 border-black p-2 text-[10px] font-black text-slate-800 uppercase tracking-tighter text-center min-w-[120px]">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekDays.map(day => {
                const isToday = day === currentDayName;
                return (
                  <tr key={day} className={`border-b-2 border-black h-32 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                    <td className={`border-r-2 border-black p-3 font-black text-xs text-center uppercase sticky left-0 z-10 ${isToday ? 'bg-indigo-600 text-white shadow-[4px_0_0_0_rgba(99,102,241,1)_inset]' : 'bg-slate-100 text-slate-800'}`}>
                      {day}
                      {isToday && <div className="mt-1 text-[8px] bg-white text-indigo-600 rounded-full px-1">NOW</div>}
                    </td>
                    {visibleSlots.map(slot => {
                      const dayEvents = getEventsForSlot(day, slot.value);
                      const isCurrentHour = day === currentDayName && slot.value === currentHour;
                      return (
                        <td key={slot.label} className="border-r-2 border-black p-0.5 relative align-top bg-slate-50/20">
                          {isCurrentHour && (
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                              style={{ left: `${progressPercent}%` }}
                            >
                              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-600 rounded-full shadow-md animate-pulse border-2 border-white"></div>
                            </div>
                          )}
                          <div className="h-full flex flex-col gap-0.5">
                            {dayEvents.map(event => (
                              <div
                                key={event.id}
                                onClick={() => setZoomedEvent(event)}
                                className={`flex-1 p-1.5 border border-slate-300 text-center flex flex-col justify-center items-center cursor-pointer hover:brightness-95 transition-all shadow-sm overflow-hidden ${event.type.includes('TP') ? 'bg-[#e2efda] text-emerald-900' : 'bg-white text-slate-900'
                                  }`}
                              >
                                <p className="text-[8px] font-black uppercase leading-tight truncate w-full">
                                  {event.title}
                                </p>
                                <p className="text-[8px] font-bold text-slate-500 truncate w-full">{event.professor}</p>
                                <div className="flex gap-1 text-[7px] font-black mt-0.5">
                                  <span className="text-indigo-600">S. {event.room}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {zoomedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setZoomedEvent(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className={`h-2 ${zoomedEvent.type.includes('TP') ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-slate-800 uppercase">{zoomedEvent.title}</h3>
                <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md uppercase">{zoomedEvent.type}</span>
              </div>
              <div className="space-y-3 text-sm font-bold text-slate-600">
                <div className="flex items-center gap-3"><UserIcon size={16} className="text-indigo-500" /> {zoomedEvent.professor}</div>
                <div className="flex items-center gap-3"><MapPin size={16} className="text-indigo-500" /> Salle {zoomedEvent.room}</div>
                <div className="flex items-center gap-3"><Users size={16} className="text-indigo-500" /> Groupes: {zoomedEvent.groups}</div>
                <div className="flex items-center gap-3"><Clock size={16} className="text-indigo-500" /> {zoomedEvent.day} - {Math.floor(zoomedEvent.hour)}H00</div>
              </div>
              <div className="pt-4">
                <button onClick={() => setZoomedEvent(null)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

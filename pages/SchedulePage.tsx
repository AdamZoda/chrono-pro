
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  Plus,
  Trash,
  Printer,
  X,
  Type,
  User as UserIcon,
  MapPin,
  Users,
  Timer,
  FileText,
  Clock,
  Filter
} from 'lucide-react';
import { EventType, ScheduleEvent } from '../types';

const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Génération des 24 créneaux horaires
const allSlots = Array.from({ length: 24 }, (_, i) => ({
  label: `${(i + 1).toString().padStart(2, '0')}H00`,
  value: i + 1,
  end: i + 2
}));

const SchedulePage: React.FC = () => {
  const { events, addEvent, removeEvent } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomedEvent, setZoomedEvent] = useState<ScheduleEvent | null>(null);

  // Time Indicator State
  const [now, setNow] = useState(new Date());
  const [nextEventText, setNextEventText] = useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const currentDate = new Date();
      setNow(currentDate);

      // --- Next Event Calculation ---
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

        // Calculate target date for this event
        const targetDate = new Date(currentDate);
        const currentDayIndex = currentDate.getDay();

        // Calculate day difference
        let dayDiff = eventDayIndex - currentDayIndex;
        // If day is past (or today but earlier hour check comes later), assume next week
        // But first, let's set the time to check properly

        targetDate.setHours(Math.floor(event.hour), 0, 0, 0); // Sets hour, min=0

        // If strictly past in the week (e.g. today Wed, event Mon) -> next week (+7)
        if (dayDiff < 0) {
          dayDiff += 7;
        }

        // Add days to target
        targetDate.setDate(currentDate.getDate() + dayDiff);

        // If it looks like today (dayDiff was 0 initially) but time is passed, it's next week
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

    updateTime(); // Initial call
    const timer = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [events]); // Recalculate if events change

  const daysMap = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const currentDayName = daysMap[now.getDay()];
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const progressPercent = (currentMinutes / 60) * 100;

  // Amplitude par défaut
  const [rangeStart, setRangeStart] = useState(8);
  const [rangeEnd, setRangeEnd] = useState(19);

  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    title: '',
    professor: '',
    room: '',
    groups: '',
    day: 'Lundi',
    hour: 8,
    type: 'Cours TD',
    notification: true
  });

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    addEvent({
      title: newEvent.title || '',
      professor: newEvent.professor || '',
      room: newEvent.room || '',
      groups: newEvent.groups || '',
      day: newEvent.day || 'Lundi',
      hour: newEvent.hour || 8,
      type: newEvent.type as EventType,
      notification: newEvent.notification || false
    });
    setIsModalOpen(false);
  };

  const getEventsForSlot = (day: string, hourValue: number) => {
    return events.filter(e => e.day === day && Math.floor(e.hour) === hourValue);
  };

  const visibleSlots = allSlots.filter(slot =>
    slot.value >= rangeStart && slot.value < rangeEnd
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter border-b-4 border-indigo-600 w-fit">Emploi du temps (24H)</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">2ème année G.I. • GESTION COMPLÈTE</p>
          {nextEventText && (
            <div className="mt-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 py-1 px-3 rounded-lg inline-flex items-center gap-2 animate-in slide-in-from-left duration-500">
              <Timer size={16} className="animate-pulse" />
              {nextEventText}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Plus size={20} />
          </button>
          <button onClick={() => window.print()} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Filtre Amplitude */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <Filter size={18} className="text-indigo-600" />
        <span className="text-xs font-bold uppercase">Amplitude :</span>
        <select value={rangeStart} onChange={e => setRangeStart(parseInt(e.target.value))} className="text-xs font-bold p-1 border rounded">
          {Array.from({ length: 23 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}H</option>)}
        </select>
        <span className="text-xs">à</span>
        <select value={rangeEnd} onChange={e => setRangeEnd(parseInt(e.target.value))} className="text-xs font-bold p-1 border rounded">
          {Array.from({ length: 24 }, (_, i) => i + 1).map(h => <option key={h} value={h + 1}>{h + 1}H</option>)}
        </select>
      </div>

      <div className="overflow-x-auto shadow-2xl rounded-sm border-2 border-black">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-black">
              <th className="border-r-2 border-black p-4 w-32 bg-slate-100 sticky left-0 z-10">Jour</th>
              {visibleSlots.map(slot => (
                <th key={slot.label} className="border-r-2 border-black p-3 text-[10px] font-black text-slate-800 uppercase tracking-widest min-w-[150px]">
                  {slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekDays.map(day => {
              const isToday = day === currentDayName;
              return (
                <tr key={day} className={`border-b-2 border-black h-40 transition-colors ${isToday ? 'bg-indigo-50/30' : ''}`}>
                  <td className={`border-r-2 border-black p-4 font-black text-slate-800 text-center uppercase sticky left-0 z-10 ${isToday ? 'bg-indigo-100/80 text-indigo-900 border-r-indigo-500 shadow-[4px_0_0_0_rgba(99,102,241,1)_inset]' : 'bg-slate-100'}`}>
                    {day}
                    {isToday && <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-white rounded-full py-0.5 px-2 inline-block">AUJOURD'HUI</div>}
                  </td>
                  {visibleSlots.map(slot => {
                    const dayEvents = getEventsForSlot(day, slot.value);
                    const isCurrentHour = isToday && slot.value === currentHour;

                    return (
                      <td key={slot.label} className="border-r-2 border-black p-1 relative align-top">
                        {/* Time Indicator Line */}
                        {isCurrentHour && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                            style={{ left: `${progressPercent}%` }}
                          >
                            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-red-600 rounded-full shadow-md animate-pulse border-2 border-white"></div>
                          </div>
                        )}

                        <div className="h-full flex flex-col gap-1">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => setZoomedEvent(event)}
                              className={`flex-1 p-2 border border-slate-300 text-center flex flex-col justify-center items-center cursor-pointer hover:shadow-inner transition-all group ${event.type.includes('TP') ? 'bg-[#e2efda] text-emerald-900' : 'bg-white text-slate-900'} ${isCurrentHour && progressPercent > 50 ? 'opacity-80' : ''}`}
                            >
                              <p className="text-[9px] font-black uppercase mb-1 leading-none">{event.title}</p>
                              <p className="text-[8px] font-bold mb-1 truncate w-full">{event.professor}</p>
                              <div className="text-[7px] font-black uppercase">S. {event.room}</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeEvent(event.id); }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 p-1 bg-white/80 rounded"
                              >
                                <Trash size={10} />
                              </button>
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

      {/* Modals (Identiques à avant) */}
      {zoomedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setZoomedEvent(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className={`h-2 ${zoomedEvent.type.includes('TP') ? 'bg-emerald-500' : 'bg-indigo-600'}`}></div>
            <div className="p-8 space-y-4">
              <h3 className="text-xl font-black text-slate-800 uppercase">{zoomedEvent.title}</h3>
              <div className="space-y-3 text-sm font-bold text-slate-600">
                <div className="flex items-center gap-3"><UserIcon size={16} /> {zoomedEvent.professor}</div>
                <div className="flex items-center gap-3"><MapPin size={16} /> Salle {zoomedEvent.room}</div>
                <div className="flex items-center gap-3"><Users size={16} /> Groupes: {zoomedEvent.groups}</div>
                <div className="flex items-center gap-3"><Clock size={16} /> {zoomedEvent.day} - {Math.floor(zoomedEvent.hour)}H00</div>
              </div>
              <div className="pt-4 flex gap-2">
                <button onClick={() => { removeEvent(zoomedEvent.id); setZoomedEvent(null); }} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold">Supprimer</button>
                <button onClick={() => setZoomedEvent(null)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-slate-800 uppercase mb-6">Ajouter un cours</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Titre (ex: P.O.O)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
              <input type="text" placeholder="Professeur" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={e => setNewEvent({ ...newEvent, professor: e.target.value })} />
              <input type="text" placeholder="Salle" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={e => setNewEvent({ ...newEvent, room: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" onChange={e => setNewEvent({ ...newEvent, day: e.target.value })}>
                  {weekDays.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" onChange={e => setNewEvent({ ...newEvent, hour: parseInt(e.target.value) })}>
                  {allSlots.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Type (ex: TD, TP, Conférence...)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} />
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold">Annuler</button>
              <button onClick={handleAddEvent} className="flex-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

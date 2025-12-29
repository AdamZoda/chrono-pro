
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Users, 
  Video, 
  LifeBuoy, 
  Trash2, 
  UserMinus, 
  MessageCircle,
  ShieldCheck,
  MoreVertical,
  Check
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const { tickets, conferences, replyToTicket, removeConference } = useAppContext();
  const [activeTab, setActiveTab] = useState<'users' | 'conferences' | 'tickets'>('tickets');
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Mock users list
  const users = [
    { id: '1', username: 'JeanD', email: 'jean@dupont.com', role: 'USER', joined: '2023-10-12' },
    { id: '2', username: 'SophieM', email: 'sophie@martin.fr', role: 'USER', joined: '2023-11-05' },
    { id: '3', username: 'AdminNexus', email: 'admin@chrononexus.com', role: 'ADMIN', joined: '2023-01-01' }
  ];

  const handleReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    replyToTicket(ticketId, replyText);
    setReplyText('');
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-slate-500">Gestion de la plateforme et des utilisateurs.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('tickets')}
          className={`pb-4 px-2 font-semibold transition-all relative ${activeTab === 'tickets' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Tickets ({tickets.filter(t => t.status === 'OPEN').length})
          {activeTab === 'tickets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 font-semibold transition-all relative ${activeTab === 'users' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Utilisateurs
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('conferences')}
          className={`pb-4 px-2 font-semibold transition-all relative ${activeTab === 'conferences' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Conférences ({conferences.length})
          {activeTab === 'conferences' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
        </button>
      </div>

      <div className="space-y-6">
        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 gap-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{ticket.title}</h3>
                      <p className="text-xs text-slate-400">Posté par <span className="font-bold text-indigo-600">{ticket.username}</span> • {new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">"{ticket.description}"</p>
                  
                  {ticket.status === 'OPEN' ? (
                    <div className="space-y-4">
                      {selectedTicket === ticket.id ? (
                        <div className="space-y-3">
                          <textarea 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Votre réponse..."
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleReply(ticket.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                            >
                              Envoyer la réponse
                            </button>
                            <button 
                              onClick={() => setSelectedTicket(null)}
                              className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-300"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedTicket(ticket.id)}
                          className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                        >
                          <MessageCircle size={16} /> Répondre au ticket
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                      <Check size={16} /> Répondu
                    </div>
                  )}
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="text-center py-12 text-slate-400">Aucun ticket reçu.</p>}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Inscrit le</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {u.username.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{u.username}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.joined}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Bannir l'utilisateur">
                        <UserMinus size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conferences Tab */}
        {activeTab === 'conferences' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map(conf => (
              <div key={conf.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Video size={20} />
                  </div>
                  <button 
                    onClick={() => removeConference(conf.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800">{conf.name}</h3>
                <p className="text-xs text-slate-500 mt-1">ID Propriétaire: {conf.ownerId}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Actif</span>
                </div>
              </div>
            ))}
            {conferences.length === 0 && <p className="col-span-full text-center py-12 text-slate-400">Aucune conférence en cours.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

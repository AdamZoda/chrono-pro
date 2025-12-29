
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  LifeBuoy, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const { tickets, addTicket } = useAppContext();
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [success, setSuccess] = useState(false);

  const userTickets = tickets.filter(t => t.userId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !user) return;
    addTicket(user.id, user.username, formData.title, formData.description);
    setFormData({ title: '', description: '' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Support & Assistance</h1>
        <p className="text-slate-500 mt-2">Nous sommes là pour vous aider à optimiser votre temps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare className="text-indigo-600" />
              Créer un Ticket
            </h2>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle size={20} />
                <span className="font-medium">Ticket envoyé avec succès ! L'administrateur vous répondra bientôt.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sujet de votre demande</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Problème d'export PDF"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description détaillée</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre problème ou votre question..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100"
              >
                <Send size={18} /> Envoyer le ticket
              </button>
            </form>
          </div>
        </div>

        {/* FAQ / Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Besoin d'aide rapide ?</h3>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <h4 className="text-sm font-semibold text-indigo-600 group-hover:underline">Comment dupliquer une semaine ?</h4>
                <p className="text-xs text-slate-500 mt-1">Allez dans planning, bouton "Dupliquer" en haut à droite.</p>
              </div>
              <div className="group cursor-pointer">
                <h4 className="text-sm font-semibold text-indigo-600 group-hover:underline">Conférence : mot de passe perdu ?</h4>
                <p className="text-xs text-slate-500 mt-1">Seul le créateur peut supprimer la conférence et en créer une nouvelle.</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <LifeBuoy className="mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Statut du Service</h3>
            <div className="flex items-center gap-2 text-indigo-100 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Tous les systèmes sont opérationnels
            </div>
            <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              Détails techniques <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket History */}
      {userTickets.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Historique de vos tickets</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {userTickets.map(ticket => (
              <div key={ticket.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{ticket.title}</h4>
                    <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{ticket.description}</p>
                {ticket.reply && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-700 uppercase mb-2">Réponse de l'admin</p>
                    <p className="text-sm text-slate-700 italic">"{ticket.reply}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;

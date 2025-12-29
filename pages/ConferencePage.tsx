
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Video, 
  Lock, 
  Plus, 
  Users, 
  Trash2, 
  ShieldCheck,
  Search,
  Key
} from 'lucide-react';

const ConferencePage: React.FC = () => {
  const { user } = useAuth();
  const { conferences, addConference, removeConference } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newConf, setNewConf] = useState({ name: '', password: '' });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const userConferences = conferences.filter(c => c.ownerId === user?.id);
  const canCreate = userConferences.length < 3;

  const handleCreate = () => {
    if (!newConf.name || !newConf.password) return;
    if (!user) return;
    addConference(newConf.name, newConf.password, user.id);
    setIsModalOpen(false);
    setNewConf({ name: '', password: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Conférences Privées</h1>
          <p className="text-slate-500">Créez des espaces de réunion sécurisés par mot de passe.</p>
        </div>
        <button 
          onClick={() => canCreate ? setIsModalOpen(true) : alert("Limite de 3 conférences atteinte.")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-lg ${canCreate ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
        >
          <Plus size={20} /> Nouvelle Conférence
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900">Espace Sécurisé</h4>
          <p className="text-sm text-indigo-700 mt-1">
            Chaque conférence est protégée par un mot de passe. Vos échanges sont confidentiels et les données sont supprimées dès la fin de la session. Limite de 3 conférences par utilisateur.
          </p>
        </div>
      </div>

      {/* Search & List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher une conférence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conferences.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(conf => (
            <div key={conf.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Video size={24} />
                  </div>
                  {conf.ownerId === user?.id && (
                    <button 
                      onClick={() => removeConference(conf.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{conf.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                  <Users size={12} />
                  <span>Jusqu'à 50 participants</span>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/conference/${conf.id}`)}
                    className="flex-1 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Privé • Protégé</span>
                <Lock size={12} className="text-slate-400" />
              </div>
            </div>
          ))}

          {conferences.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Video size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucune conférence active pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal create */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Nouvelle Session</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la conférence</label>
                <input
                  type="text"
                  value={newConf.name}
                  onChange={(e) => setNewConf({ ...newConf, name: e.target.value })}
                  placeholder="Ex: Sprint Planning IT"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe d'accès</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newConf.password}
                    onChange={(e) => setNewConf({ ...newConf, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Key className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Annuler</button>
              <button onClick={handleCreate} className="flex-2 px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferencePage;


import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  Plus,
  Search,
  Trash2,
  StickyNote,
  Calendar as CalendarIcon,
  X,
  FileText
} from 'lucide-react';

const NotesPage: React.FC = () => {
  const { notes, addNote, removeNote } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    addNote(newNote.title, newNote.content);
    setNewNote({ title: '', content: '' });
    setIsModalOpen(false);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter border-b-4 border-amber-500 w-fit">Mes Notes</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">Espace de réflexion et rappels personnels</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={20} /> Nouvelle Note
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Rechercher dans vos notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-sm shadow-sm"
        />
        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
      </div>

      {/* Grille de notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <div
            key={note.id}
            className="bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col min-h-[200px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <FileText size={20} />
              </div>
              <button
                onClick={() => removeNote(note.id)}
                className="text-amber-300 hover:text-red-500 transition-colors p-1"
                title="Supprimer la note"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2 line-clamp-1">{note.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed flex-1 whitespace-pre-wrap">{note.content}</p>
            <div className="mt-6 pt-4 border-t border-amber-200 flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">
              <CalendarIcon size={12} />
              {new Date(note.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <StickyNote size={40} />
            </div>
            <p className="text-slate-400 font-bold italic">Aucune note trouvée. Commencez par en créer une !</p>
          </div>
        )}
      </div>

      {/* Modal Création */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-t-8 border-amber-500">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Créer une note</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Titre de la note</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Ex: Idées projet Fin d'études"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contenu</label>
                  <textarea
                    required
                    rows={6}
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Écrivez vos pensées ici..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 resize-none font-medium"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-2 px-10 py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-95"
                  >
                    Enregistrer la note
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;


import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  Camera,
  Mail,
  Phone,
  Lock,
  Trash2,
  Save,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  // Destructure addNotification from useAppContext
  const { addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Use addNotification to show a success message after profile update
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateProfile(formData);
      setLoading(false);
      addNotification('Profil mis à jour !', 'success');
    }, 500);
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      deleteAccount();
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setLoading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      if (data) {
        // Update local state immediately for feedback
        updateProfile({ avatar: data.publicUrl });
        addNotification('Photo de profil mise à jour !', 'success');
      }

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      addNotification('Erreur lors du téléchargement de la photo (Le bucket "avatars" existe-t-il ?)', 'alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mon Profil</h1>
        <p className="text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-indigo-600 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-32 h-32 rounded-3xl border-4 border-white object-cover bg-white"
              />
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                <Camera size={24} />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <UserIcon size={18} className="text-indigo-600" /> Informations Personnelles
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prénom</label>
                  <input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nom</label>
                  <input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" /> Contact & Sécurité
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                    />
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Téléphone</label>
                  <div className="relative">
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                    />
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nouveau Mot de Passe</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                    />
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:bg-indigo-400"
              >
                <Save size={18} /> {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-8 py-3 bg-white text-red-600 border border-red-100 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 ml-auto"
              >
                <Trash2 size={18} /> Supprimer mon compte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

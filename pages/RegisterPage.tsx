
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return alert('Mots de passe non identiques');
    if (!formData.acceptTerms) return alert('Vous devez accepter les conditions');

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Registration Error:", err);
      // alert("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Créer un compte</h1>
            <p className="text-slate-500 mt-2">Rejoignez la révolution de la gestion du temps</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authError && (
              <div className="col-span-full bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{authError}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
              <div className="relative">
                <input
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  placeholder="JeanD"
                />
                <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                placeholder="Jean"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                placeholder="Dupont"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  placeholder="jean@exemple.com"
                />
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <div className="relative">
                <input
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  placeholder="+33 6 12 34 56 78"
                />
                <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmation</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="col-span-full">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800">
                  J'accepte les <button type="button" className="text-indigo-600 hover:underline">conditions d'utilisation</button> et la politique de confidentialité.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="col-span-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4 disabled:bg-indigo-400"
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
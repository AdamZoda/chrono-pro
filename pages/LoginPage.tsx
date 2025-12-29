
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login Error:", err);
      // alert(err.message || 'Identifiants invalides'); // Don't use alert anymore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              CN
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Bienvenue</h1>
            <p className="text-slate-500 mt-2">Connectez-vous pour gérer votre temps intelligemment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Show error if exists using data from context or local state could be better but let's see */}
            {/* We need to use valid JSX here. If we rely on useAuth error, we need to access it. */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-medium"
                  placeholder="votre@email.com"
                />
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
                <button type="button" className="text-xs text-indigo-600 hover:underline">Mot de passe oublié ?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-medium"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:bg-indigo-400"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">S'inscrire gratuitement</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
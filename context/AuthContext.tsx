
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  deleteAccount: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Supabase Session Error:', error);
        setLoading(false);
      } else if (data.session?.user) {
        fetchProfile(data.session.user.id, data.session.user.email!);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error('Supabase Initialization Error:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setUser({
          id: data.id,
          username: data.username || email.split('@')[0],
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || email,
          phone: data.phone || '',
          role: (data.role as Role) || 'USER',
          avatar: data.avatar
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrUsername: string, pass: string) => {
    setError(null);

    // BACKDOOR: Admin Login for Dev Testing
    if (emailOrUsername === 'admin' && pass === 'admin') {
      setUser({
        id: 'admin-backdoor',
        username: 'SuperAdmin',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@chrononexus.internal',
        phone: '0000000000',
        role: 'ADMIN',
        avatar: 'https://ui-avatars.com/api/?name=Admin+Root&background=0D8ABC&color=fff'
      });
      return;
    }

    let loginEmail = emailOrUsername;

    // Check if input is NOT an email (simple check)
    if (!emailOrUsername.includes('@')) {
      // Try to find email from username (case-insensitive)
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', emailOrUsername)
        .maybeSingle();

      if (profileError) {
        console.error("Username lookup failed:", profileError);
        throw new Error("Erreur système lors de la connexion.");
      }

      if (!data) {
        throw new Error("Nom d'utilisateur introuvable.");
      }

      if (data.email) {
        loginEmail = data.email;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: pass,
    });

    if (error) {
      setError(error.message);
      throw error;
    }
  };

  const register = async (data: any) => {
    setError(null);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username, // ✅ Add username so trigger can save it
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone, // ✅ Add phone as well
          role: 'USER' // Force USER role on signup
        }
      }
    });

    if (error) {
      setError(error.message);
      throw error;
    }

    if (authData.user && !authData.session) {
      setError("Compte créé ! Veuillez vérifier vos emails pour confirmer votre compte avant de vous connecter.");
      throw new Error("Veuillez vérifier vos emails pour confirmer votre compte.");
    }
  };

  const logout = async () => {
    if (user?.id === 'admin-backdoor') {
      setUser(null);
    } else {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    // Skip Supabase update for backdoor admin
    if (user.id === 'admin-backdoor') {
      setUser({ ...user, ...data });
      return;
    }

    const updates = {
      username: data.username,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      avatar: data.avatar,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } else {
      setUser({ ...user, ...data });
    }
  };

  const deleteAccount = async () => {
    // Only real users can be deleted via Supabase
    if (user?.id !== 'admin-backdoor') {
      // Note: This requires a Supabase Function usually, or user self-deletion policy
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile, deleteAccount, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScheduleEvent, Note, Conference, Ticket, Notification } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  events: ScheduleEvent[];
  addEvent: (e: Omit<ScheduleEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  notes: Note[];
  addNote: (title: string, content: string) => void;
  removeNote: (id: string) => void;
  conferences: Conference[];
  addConference: (name: string, pass: string, ownerId: string) => void;
  removeConference: (id: string) => void;
  tickets: Ticket[];
  addTicket: (userId: string, username: string, title: string, desc: string) => void;
  replyToTicket: (id: string, reply: string) => void;
  notifications: Notification[];
  addNotification: (msg: string, type: 'info' | 'alert' | 'success') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch data when user logs in
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setNotes([]);
      setConferences([]);
      setTickets([]);
      setNotifications([]);
      return;
    }

    // If Backdoor Admin, load mock data or specific admin data
    // For now, we will just start empty or fetch from Supabase if we removed the "admin-backdoor" check in policies
    // But since "admin-backdoor" is not a valid UUID, Supabase calls will fail or return empty.
    // So we'll skip Supabase calls for the backdoor admin for now, or just let them return empty.
    if (user.id === 'admin-backdoor') {
      // Optional: Load some dummy data for admin test
      return;
    }

    const fetchData = async () => {
      // 1. Events
      // 1. Events (RLS auto-filters this to user's events)
      const { data: eventsData, error: eventsError } = await supabase.from('events').select('*');
      if (eventsError) console.error('Error fetching events:', eventsError);
      if (eventsData) setEvents(eventsData.map(e => ({ ...e, notification: e.notification })));

      // 2. Notes
      const { data: notesData } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
      if (notesData) setNotes(notesData.map(n => ({ ...n, content: n.content, createdAt: n.created_at })));

      // 3. Conferences
      const { data: confData } = await supabase.from('conferences').select('*');
      if (confData) setConferences(confData.map(c => ({ ...c, passwordHash: c.password_hash, ownerId: c.owner_id, isActive: c.is_active, createdAt: c.created_at })));

      // 4. Tickets (fetch separately then get usernames)
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*');

      if (ticketsError) console.error('Error fetching tickets:', ticketsError);

      if (ticketsData && ticketsData.length > 0) {
        const userIds = [...new Set(ticketsData.map(t => t.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const usernameMap = new Map(profilesData?.map(p => [p.id, p.username]) || []);

        setTickets(ticketsData.map(t => ({
          id: t.id,
          userId: t.user_id,
          username: usernameMap.get(t.user_id) || 'Unknown',
          title: t.title,
          description: t.description,
          status: t.status,
          reply: t.reply,
          createdAt: t.created_at
        })));
      } else if (ticketsData) {
        setTickets([]);
      }

      // 5. Notifications
      const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (notifData) setNotifications(notifData.map(n => ({ ...n, isRead: n.is_read })));
    };

    fetchData();
  }, [user]);

  const addEvent = async (e: Omit<ScheduleEvent, 'id'>) => {
    if (!user) return;
    if (user.id === 'admin-backdoor') {
      const newEvent = { ...e, id: Math.random().toString(36).substr(2, 9) };
      setEvents([...events, newEvent]);
      return;
    }

    const { data, error } = await supabase.from('events').insert([{
      user_id: user.id, // Explicitly link event to current user
      title: e.title,
      description: e.description,
      professor: e.professor,
      room: e.room,
      groups: e.groups,
      day: e.day,
      hour: e.hour,
      duration: e.duration,
      type: e.type,
      notification: e.notification
    }]).select().single();

    if (error) {
      console.error('Error adding event:', error);
      addNotification(`Erreur lors de l'ajout: ${error.message}`, 'alert');
    }

    if (data && !error) {
      setEvents([...events, { ...data, notification: data.notification }]);
      addNotification(`Nouvel événement: ${e.title}`, 'info');
    }
  };

  const removeEvent = async (id: string) => {
    if (user?.id === 'admin-backdoor') {
      setEvents(events.filter(e => e.id !== id));
      return;
    }
    await supabase.from('events').delete().eq('id', id);
    setEvents(events.filter(e => e.id !== id));
  };

  const addNote = async (title: string, content: string) => {
    if (!user) return;
    if (user.id === 'admin-backdoor') {
      const newNote = { id: Math.random().toString(36).substr(2, 9), title, content, createdAt: new Date().toISOString() };
      setNotes([newNote, ...notes]);
      return;
    }

    const { data, error } = await supabase.from('notes').insert([{
      user_id: user.id,
      title,
      content
    }]).select().single();

    if (data && !error) {
      setNotes([{ ...data, content: data.content, createdAt: data.created_at }, ...notes]);
    }
  };

  const removeNote = async (id: string) => {
    if (user?.id === 'admin-backdoor') {
      setNotes(notes.filter(n => n.id !== id));
      return;
    }
    await supabase.from('notes').delete().eq('id', id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const addConference = async (name: string, pass: string, ownerId: string) => {
    if (user?.id === 'admin-backdoor') {
      const newConf = { id: Math.random().toString(36).substr(2, 9), name, passwordHash: pass, ownerId, createdAt: new Date().toISOString(), isActive: true };
      setConferences([...conferences, newConf]);
      return;
    }

    const { data, error } = await supabase.from('conferences').insert([{
      name,
      password_hash: pass,
      owner_id: ownerId
    }]).select().single();

    if (data && !error) {
      setConferences([...conferences, { ...data, passwordHash: data.password_hash, ownerId: data.owner_id, isActive: data.is_active, createdAt: data.created_at }]);
      addNotification(`Conférence "${name}" créée.`, 'success');
    }
  };

  const removeConference = async (id: string) => {
    if (user?.id === 'admin-backdoor') {
      setConferences(conferences.filter(c => c.id !== id));
      return;
    }
    await supabase.from('conferences').delete().eq('id', id);
    setConferences(conferences.filter(c => c.id !== id));
  };

  const addTicket = async (userId: string, username: string, title: string, desc: string) => {
    if (user?.id === 'admin-backdoor') {
      const newTicket = { id: Math.random().toString(36).substr(2, 9), userId, username, title, description: desc, status: 'OPEN' as const, createdAt: new Date().toISOString() };
      setTickets([...tickets, newTicket]);
      return;
    }

    const { data, error } = await supabase.from('tickets').insert([{
      user_id: userId,
      title,
      description: desc
    }]).select().single();

    if (data && !error) {
      setTickets([...tickets, { ...data, userId: data.user_id, username, status: data.status, createdAt: data.created_at }]);
    }
  };

  const replyToTicket = async (id: string, reply: string) => {
    // Logic for reply usually implies admin update
    if (user?.id === 'admin-backdoor') {
      setTickets(tickets.map(t => t.id === id ? { ...t, reply, status: 'CLOSED' } : t));
      return;
    }

    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    const { error } = await supabase.from('tickets').update({ reply, status: 'CLOSED' }).eq('id', id);
    if (!error) {
      setTickets(tickets.map(t => t.id === id ? { ...t, reply, status: 'CLOSED' } : t));

      // Create notification for the user
      await supabase.from('notifications').insert([{
        user_id: ticket.userId,
        message: `Votre ticket "${ticket.title}" a reçu une réponse de l'admin.`,
        type: 'info'
      }]);
    }
  };

  const addNotification = async (message: string, type: 'info' | 'alert' | 'success') => {
    // Notifications are often system-generated or local, but we have a table
    if (!user || user.id === 'admin-backdoor') {
      setNotifications([{ id: Math.random().toString(36).substr(2, 9), message, type, time: new Date().toLocaleTimeString() }, ...notifications]);
      return;
    }

    const { data, error } = await supabase.from('notifications').insert([{
      user_id: user.id,
      message,
      type
    }]).select().single();

    if (data && !error) {
      setNotifications([{ ...data, isRead: data.is_read }, ...notifications]);
    }
  };

  return (
    <AppContext.Provider value={{
      events, addEvent, removeEvent,
      notes, addNote, removeNote,
      conferences, addConference, removeConference,
      tickets, addTicket, replyToTicket,
      notifications, addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};


export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
}

// EventType can be any string now to allow free text input
export type EventType = string;

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  professor?: string;
  room?: string;
  groups?: string;
  day: string; // 'Lundi', 'Mardi', etc.
  hour: number; // 0-23
  duration?: number; // duration in hours
  type: EventType;
  notification: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Conference {
  id: string;
  name: string;
  passwordHash: string;
  ownerId: string;
  createdAt: string;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
  reply?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  time: string;
}

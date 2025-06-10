import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, NewLeadData, LeadStatus } from '@/types/leads';
import { SupportTicket, NewTicketData, TicketStatus } from '@/types/support';
import { useAuth } from './AuthContext';
import { supabase } from '@/types/supabaseClient';

interface DataContextType {
  leads: Lead[];
  supportTickets: SupportTicket[];
  addLead: (leadData: NewLeadData) => Promise<void>;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => Promise<void>;
  assignLeadToTechnician: (leadId: string, technicianId: string) => Promise<void>;
  addSupportTicket: (ticketData: NewTicketData) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, notes?: string) => Promise<void>;
  assignTicketToTechnician: (ticketId: string, technicianId: string) => Promise<void>;
  getUserLeads: (userId: string) => Lead[];
  getUserTickets: (userId: string) => SupportTicket[];
  getAllUsers: () => any[];
  getTechnicians: () => any[];
  getCallOperators: () => any[];
  getSalesmen: () => any[];
  addUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getAnalytics: () => any;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch initial data
  const fetchAll = async () => {
    setIsLoading(true);
    const [{ data: l }, { data: t }, { data: u }] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('support_tickets').select('*'),
      supabase.from('users').select('*'),
    ]);
    setLeads(l ?? []);
    setSupportTickets(t ?? []);
    setUsers(u ?? []);
    setIsLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Real-time subscriptions
  useEffect(() => {
    const leadSub = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchAll)
      .subscribe();

    const ticketSub = supabase
      .channel('public:support_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(leadSub);
      supabase.removeChannel(ticketSub);
    };
  }, []);

  // CRUD functions
  const addLead = async (leadData: NewLeadData) => {
    if (!user) return;
    await supabase.from('leads').insert({
      ...leadData,
      status: 'new',
      salesman_id: user.id,
      salesman_name: user.name,
      created_at: new Date(),
      updated_at: new Date(),
    });
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, notes?: string) => {
    const updates: any = { status, updated_at: new Date() };
    if (notes) {
      updates.call_notes = status === 'contacted' ? notes : undefined;
      updates.visit_notes = ['transit', 'completed'].includes(status) ? notes : undefined;
    }
    if (status === 'contacted' && user) {
      updates.call_operator_id = user.id;
      updates.call_operator_name = user.name;
    }
    await supabase.from('leads').update(updates).eq('id', leadId);
  };

  const assignLeadToTechnician = async (leadId: string, technicianId: string) => {
    const tech = users.find(u => u.id === technicianId);
    if (!tech) return;
    await supabase.from('leads').update({
      technician_id: technicianId,
      technician_name: tech.name,
      status: 'transit',
      updated_at: new Date(),
    }).eq('id', leadId);
  };

  const addSupportTicket = async (ticketData: NewTicketData) => {
    if (!user) return;
    await supabase.from('support_tickets').insert({
      ...ticketData,
      status: 'open',
      operator_id: user.id,
      operator_name: user.name,
      created_at: new Date(),
      updated_at: new Date(),
    });
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus, notes?: string) => {
    const updates: any = { status, updated_at: new Date() };
    if (notes) updates.notes = notes;
    if (status === 'resolved') updates.resolved_at = new Date();
    await supabase.from('support_tickets').update(updates).eq('id', ticketId);
  };

  const assignTicketToTechnician = async (ticketId: string, technicianId: string) => {
    const tech = users.find(u => u.id === technicianId);
    if (!tech) return;
    await supabase.from('support_tickets').update({
      technician_id: technicianId,
      technician_name: tech.name,
      status: 'in_progress',
      updated_at: new Date(),
    }).eq('id', ticketId);
  };

  // Role-based getters
  const getUserLeads = (userId: string) => {
    if (!user) return [];
    switch (user.role) {
      case 'salesman':
        return leads.filter(l => l.salesmanId === userId);
      case 'call_operator':
        return leads.filter(l => l.status === 'new' || l.callOperatorId === userId);
      case 'technician':
        return leads.filter(l => l.technicianId === userId);
      case 'super_admin':
        return leads;
      default:
        return [];
    }
  };

  const getUserTickets = (userId: string) => {
    if (!user) return [];
    switch (user.role) {
      case 'call_operator':
        return supportTickets.filter(t => t.operatorId === userId || !t.technicianId);
      case 'technician':
        return supportTickets.filter(t => t.technicianId === userId);
      case 'super_admin':
        return supportTickets;
      default:
        return [];
    }
  };

  const getAllUsers = () => users;
  const getTechnicians = () => users.filter(u => u.role === 'technician' && u.isActive);
  const getCallOperators = () => users.filter(u => u.role === 'call_operator' && u.isActive);
  const getSalesmen = () => users.filter(u => u.role === 'salesman' && u.isActive);

  const addUser = async (userData: any) => {
    await supabase.from('users').insert({ ...userData, is_active: true, created_at: new Date() });
  };

  const updateUser = async (userId: string, userData: any) => {
    await supabase.from('users').update(userData).eq('id', userId);
  };

  const deleteUser = async (userId: string) => {
    await supabase.from('users').delete().eq('id', userId);
  };

  const getAnalytics = () => {
    const totalLeads = leads.length;
    const completedLeads = leads.filter(l => l.status === 'completed').length;
    const activeTickets = supportTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
    const conversionRate = totalLeads > 0 ? ((completedLeads / totalLeads) * 100).toFixed(1) : '0';
    const monthlyLeads = leads.filter(l => new Date(l.createdAt).getMonth() === new Date().getMonth()).length;
    return { totalLeads, completedLeads, activeTickets, conversionRate, totalUsers: users.length, activeUsers: users.filter(u => u.isActive).length, monthlyLeads };
  };

  const refreshData = () => fetchAll();

  return (
    <DataContext.Provider value={{
      leads, supportTickets, addLead, updateLeadStatus, assignLeadToTechnician,
      addSupportTicket, updateTicketStatus, assignTicketToTechnician,
      getUserLeads, getUserTickets, getAllUsers, getTechnicians, getCallOperators, getSalesmen,
      addUser, updateUser, deleteUser, getAnalytics,
      isLoading, refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
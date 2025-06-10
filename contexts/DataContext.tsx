import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, NewLeadData, LeadStatus } from '@/types/leads';
import { SupportTicket, NewTicketData, TicketStatus } from '@/types/support';
import { useAuth } from './AuthContext';

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

// Enhanced mock data for comprehensive testing
const mockLeads: Lead[] = [
  {
    id: '1',
    customerName: 'Rajesh Kumar',
    phoneNumber: '+91-9876543220',
    email: 'rajesh@email.com',
    address: '123 MG Road, Koramangala, Bangalore - 560034',
    propertyType: 'residential',
    likelihood: 'hot',
    status: 'new',
    salesmanId: '1',
    salesmanName: 'John Sales',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    customerName: 'Priya Sharma',
    phoneNumber: '+91-9876543221',
    email: 'priya.sharma@email.com',
    address: '456 Brigade Road, Commercial Street, Bangalore - 560025',
    propertyType: 'commercial',
    likelihood: 'warm',
    status: 'contacted',
    salesmanId: '1',
    salesmanName: 'John Sales',
    callOperatorId: '2',
    callOperatorName: 'Sarah Operator',
    callNotes: 'Customer is interested in 10kW system. Wants detailed quote and ROI analysis. Prefers installation in next quarter.',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z'
  },
  {
    id: '3',
    customerName: 'Amit Patel',
    phoneNumber: '+91-9876543222',
    email: 'amit.patel@email.com',
    address: '789 Whitefield Main Road, ITPL, Bangalore - 560066',
    propertyType: 'residential',
    likelihood: 'hot',
    status: 'transit',
    salesmanId: '1',
    salesmanName: 'John Sales',
    callOperatorId: '2',
    callOperatorName: 'Sarah Operator',
    technicianId: '3',
    technicianName: 'Mike Tech',
    callNotes: 'Very interested customer. Ready for immediate installation. Has south-facing roof.',
    createdAt: '2024-01-13T14:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z'
  },
  {
    id: '4',
    customerName: 'Sunita Reddy',
    phoneNumber: '+91-9876543223',
    email: 'sunita.reddy@email.com',
    address: '321 HSR Layout, Sector 2, Bangalore - 560102',
    propertyType: 'residential',
    likelihood: 'warm',
    status: 'completed',
    salesmanId: '1',
    salesmanName: 'John Sales',
    callOperatorId: '2',
    callOperatorName: 'Sarah Operator',
    technicianId: '3',
    technicianName: 'Mike Tech',
    callNotes: 'Customer agreed to 5kW system installation.',
    visitNotes: 'Installation completed successfully. 5kW system with 20 panels. Customer very satisfied.',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-14T17:00:00Z'
  },
  {
    id: '5',
    customerName: 'Vikram Singh',
    phoneNumber: '+91-9876543224',
    email: 'vikram.singh@email.com',
    address: '654 Indiranagar, 100 Feet Road, Bangalore - 560038',
    propertyType: 'commercial',
    likelihood: 'cold',
    status: 'hold',
    salesmanId: '1',
    salesmanName: 'John Sales',
    callOperatorId: '2',
    callOperatorName: 'Sarah Operator',
    callNotes: 'Customer interested but wants to wait for government subsidies. Follow up in 3 months.',
    followUpDate: '2024-04-15T10:00:00Z',
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z'
  },
  {
    id: '6',
    customerName: 'Meera Nair',
    phoneNumber: '+91-9876543225',
    email: 'meera.nair@email.com',
    address: '987 Jayanagar, 4th Block, Bangalore - 560011',
    propertyType: 'residential',
    likelihood: 'warm',
    status: 'declined',
    salesmanId: '1',
    salesmanName: 'John Sales',
    callOperatorId: '2',
    callOperatorName: 'Sarah Operator',
    callNotes: 'Customer decided not to proceed due to budget constraints.',
    createdAt: '2024-01-11T15:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  }
];

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    customerId: '4',
    customerName: 'Sunita Reddy',
    customerPhone: '+91-9876543223',
    title: 'Solar panel cleaning required',
    description: 'Customer reports reduced efficiency after dust storm. Panels need professional cleaning service.',
    priority: 'medium',
    status: 'open',
    operatorId: '2',
    operatorName: 'Sarah Operator',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  },
  {
    id: '2',
    customerId: '4',
    customerName: 'Sunita Reddy',
    customerPhone: '+91-9876543223',
    title: 'Inverter display showing error',
    description: 'Inverter display shows "Grid Fault" error intermittently. System still producing power but customer concerned.',
    priority: 'high',
    status: 'in_progress',
    operatorId: '2',
    operatorName: 'Sarah Operator',
    technicianId: '3',
    technicianName: 'Mike Tech',
    notes: 'Technician dispatched. Likely grid voltage fluctuation issue.',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Amit Patel',
    customerPhone: '+91-9876543222',
    title: 'Monthly maintenance check',
    description: 'Scheduled monthly maintenance and performance check for 6-month-old installation.',
    priority: 'low',
    status: 'resolved',
    operatorId: '2',
    operatorName: 'Sarah Operator',
    technicianId: '3',
    technicianName: 'Mike Tech',
    notes: 'Maintenance completed. All systems functioning optimally. Next check due in February.',
    resolvedAt: '2024-01-13T16:00:00Z',
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z'
  }
];

// Mock users data for user management
const mockUsers = [
  {
    id: '1',
    name: 'John Sales',
    email: 'john@roshni.com',
    phone: '+91-9876543210',
    role: 'salesman',
    isActive: true,
    createdAt: '2024-01-01',
    territory: 'Bangalore South'
  },
  {
    id: '2',
    name: 'Sarah Operator',
    email: 'sarah@roshni.com',
    phone: '+91-9876543211',
    role: 'call_operator',
    isActive: true,
    createdAt: '2024-01-01',
    shift: 'Day Shift'
  },
  {
    id: '3',
    name: 'Mike Tech',
    email: 'mike@roshni.com',
    phone: '+91-9876543212',
    role: 'technician',
    isActive: true,
    createdAt: '2024-01-01',
    specialization: 'Residential & Commercial'
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@roshni.com',
    phone: '+91-9876543213',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    id: '5',
    name: 'Rahul Sales',
    email: 'rahul@roshni.com',
    phone: '+91-9876543214',
    role: 'salesman',
    isActive: true,
    createdAt: '2024-01-02',
    territory: 'Bangalore North'
  },
  {
    id: '6',
    name: 'Priya Operator',
    email: 'priya.op@roshni.com',
    phone: '+91-9876543215',
    role: 'call_operator',
    isActive: true,
    createdAt: '2024-01-02',
    shift: 'Night Shift'
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(mockTickets);
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addLead = async (leadData: NewLeadData): Promise<void> => {
    if (!user) return;
    
    const newLead: Lead = {
      id: Date.now().toString(),
      ...leadData,
      status: 'new',
      salesmanId: user.id,
      salesmanName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStatus = async (leadId: string, status: LeadStatus, notes?: string): Promise<void> => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { 
            ...lead, 
            status, 
            ...(notes && status === 'contacted' && { callNotes: notes }),
            ...(notes && (status === 'transit' || status === 'completed') && { visitNotes: notes }),
            ...(status === 'contacted' && user && { callOperatorId: user.id, callOperatorName: user.name }),
            updatedAt: new Date().toISOString()
          }
        : lead
    ));
  };

  const assignLeadToTechnician = async (leadId: string, technicianId: string): Promise<void> => {
    const technician = users.find(u => u.id === technicianId);
    if (!technician) return;
    
    setLeads(prev => prev.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            technicianId,
            technicianName: technician.name,
            status: 'transit',
            updatedAt: new Date().toISOString()
          }
        : lead
    ));
  };

  const addSupportTicket = async (ticketData: NewTicketData): Promise<void> => {
    if (!user) return;

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      ...ticketData,
      status: 'open',
      operatorId: user.id,
      operatorName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSupportTickets(prev => [newTicket, ...prev]);
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus, notes?: string): Promise<void> => {
    setSupportTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status,
            ...(notes && { notes }),
            ...(status === 'resolved' && { resolvedAt: new Date().toISOString() }),
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
  };

  const assignTicketToTechnician = async (ticketId: string, technicianId: string): Promise<void> => {
    const technician = users.find(u => u.id === technicianId);
    if (!technician) return;
    
    setSupportTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            technicianId,
            technicianName: technician.name,
            status: 'in_progress',
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
  };

  const getUserLeads = (userId: string): Lead[] => {
    if (!user) return [];
    
    switch (user.role) {
      case 'salesman':
        return leads.filter(lead => lead.salesmanId === userId);
      case 'call_operator':
        return leads.filter(lead => lead.status === 'new' || lead.callOperatorId === userId);
      case 'technician':
        return leads.filter(lead => lead.technicianId === userId);
      case 'super_admin':
        return leads;
      default:
        return [];
    }
  };

  const getUserTickets = (userId: string): SupportTicket[] => {
    if (!user) return [];
    
    switch (user.role) {
      case 'call_operator':
        return supportTickets.filter(ticket => ticket.operatorId === userId || !ticket.technicianId);
      case 'technician':
        return supportTickets.filter(ticket => ticket.technicianId === userId);
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

  const addUser = async (userData: any): Promise<void> => {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (userId: string, userData: any): Promise<void> => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...userData } : u));
  };

  const deleteUser = async (userId: string): Promise<void> => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getAnalytics = () => {
    const totalLeads = leads.length;
    const completedLeads = leads.filter(l => l.status === 'completed').length;
    const activeTickets = supportTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
    const conversionRate = totalLeads > 0 ? (completedLeads / totalLeads * 100).toFixed(1) : '0';
    
    return {
      totalLeads,
      completedLeads,
      activeTickets,
      conversionRate,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      monthlyLeads: leads.filter(l => {
        const leadDate = new Date(l.createdAt);
        const now = new Date();
        return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
      }).length
    };
  };

  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <DataContext.Provider value={{
      leads,
      supportTickets,
      addLead,
      updateLeadStatus,
      assignLeadToTechnician,
      addSupportTicket,
      updateTicketStatus,
      assignTicketToTechnician,
      getUserLeads,
      getUserTickets,
      getAllUsers,
      getTechnicians,
      getCallOperators,
      getSalesmen,
      addUser,
      updateUser,
      deleteUser,
      getAnalytics,
      isLoading,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
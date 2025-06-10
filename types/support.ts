export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  operatorId: string;
  operatorName: string;
  technicianId?: string;
  technicianName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface NewTicketData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  title: string;
  description: string;
  priority: TicketPriority;
}
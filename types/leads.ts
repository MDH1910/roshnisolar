export type LeadStatus = 'new' | 'contacted' | 'hold' | 'transit' | 'declined' | 'completed';
export type LeadLikelihood = 'hot' | 'warm' | 'cold';
export type PropertyType = 'residential' | 'commercial' | 'industrial';

export interface Lead {
  id: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  propertyType: PropertyType;
  likelihood: LeadLikelihood;
  status: LeadStatus;
  salesmanId: string;
  salesmanName: string;
  callOperatorId?: string;
  callOperatorName?: string;
  technicianId?: string;
  technicianName?: string;
  callNotes?: string;
  visitNotes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewLeadData {
  customerName: string;
  phoneNumber: string;
  address: string;
  propertyType: PropertyType;
  likelihood: LeadLikelihood;
}
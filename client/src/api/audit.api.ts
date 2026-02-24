import api from './axios';
import { ApiResponse } from '../types';

export interface AuditLog {
  id: number;
  created_at: string;
  performed_by: string;
  full_name: string;
  role: string;
  action: string;
  ip_address: string;
  metadata?: string;
}

export const auditApi = {
  // Get all audit logs
  getAll: async (): Promise<AuditLog[]> => {
    try {
      const response = await api.get<ApiResponse<AuditLog[]>>('/audit-logs', {
        params: { _t: new Date().getTime() }
      });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  // Get audit log by ID
  getById: async (id: number): Promise<AuditLog | null> => {
    try {
      const response = await api.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return null;
    }
  },

  // Create audit log (usually called from backend, but can be exposed for frontend if needed)
  create: async (logData: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog | null> => {
    try {
      const response = await api.post<ApiResponse<AuditLog>>('/audit-logs', logData);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating audit log:', error);
      return null;
    }
  }
};
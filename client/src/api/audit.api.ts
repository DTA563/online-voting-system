import api from './axios';
import { ApiResponse } from '../types';

// Updated to match your actual backend payload
export interface AuditLog {
  log_id: number;       // Changed from 'id' to 'log_id'
  created_at: string;
  performed_by: string;
  action: string;
  ip_address: string;
  full_name?: string;   // Made optional (?)
  role?: string;        // Made optional (?)
  metadata?: string;    // Made optional (?)
}

export const auditApi = {
  // Get all standard audit logs
  getAll: async (): Promise<AuditLog[]> => {
    try {
      // FIXED: Changed from '/audit-logs' to '/super-admin/logs' to match your backend route
      const response = await api.get<ApiResponse<AuditLog[]>>('/super-admin/logs', {
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

  // NEW: Get Super Admin specific logs (moved from adminApi)
  // Note: This now calls the same endpoint as getAll, but I've left it here in case 
  // you are calling it from other components in your app.
  getSuperAdminLogs: async (): Promise<AuditLog[]> => {
    try {
      const response = await api.get('/super-admin/logs');
      
      // Handle potential wrappers just in case
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching super admin logs:', error);
      return [];
    }
  },

  // Get audit log by ID
  getById: async (id: number): Promise<AuditLog | null> => {
    try {
      // FIXED: Updated prefix to match the super admin routes
      const response = await api.get<ApiResponse<AuditLog>>(`/super-admin/logs/${id}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return null;
    }
  },

  // Create audit log 
  // Updated Omit to use 'log_id' instead of 'id'
  create: async (logData: Omit<AuditLog, 'log_id' | 'created_at'>): Promise<AuditLog | null> => {
    try {
      // Note: Usually, the backend creates logs internally (like we saw in your controller).
      // If you ever need the frontend to manually create one, ensure this route exists on the backend!
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
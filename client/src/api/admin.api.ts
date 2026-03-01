import api from './axios';
import { User } from '../types';

// Define the Stats interface based on your actual backend payload
export interface DashboardStats {
  users: { by_role: Record<string, number>; pending: number };
  elections: { total: number; active: number; completed: number };
}

export const adminApi = {
  getStats: async (): Promise<DashboardStats | null> => {
    try {
      const response = await api.get('/admin/stats');
      
      // Unpack the wrapper so components get the actual stats directly
      if (response.data && response.data.data) {
        return response.data.data; 
      }
      return response.data; // Fallback
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  },
  
  // NOTE: getLogs has been successfully migrated to audit.api.ts
  
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/super-admin/users');
      // console.log('Raw API response:', response);
      // console.log('Response data:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Format: { data: [...] }
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // Format: [...]
        return response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        // Format: { users: [...] }
        return response.data.users;
      } else {
        console.error('Unexpected API response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  manageUser: async (data: { targetUserId: string, newRole?: string, newStatus?: string }) => {
    const response = await api.patch('/super-admin/users/manage', data);
    return response.data;
  },

  updateRole: async (data: { targetUserId: string, newRole: string }) => {
    // Reusing the manage endpoint since it accepts newRole
    const response = await api.patch('/super-admin/users/manage', data);
    return response.data;
  },

  resetPassword: async (targetUserId: string) => {
    const response = await api.post('/super-admin/users/reset-password', { targetUserId });
    return response.data;
  }
};
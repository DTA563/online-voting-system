import api from './axios';
import { User } from '../types';

export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  // Super Admin Extensions
  getLogs: async () => {
    const response = await api.get('/super-admin/logs');
    return response.data;
  },
  
  
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/super-admin/users');
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
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

  resetPassword: async (targetUserId: string) => {
    const response = await api.post('/super-admin/users/reset-password', { targetUserId });
    return response.data;
  }
};
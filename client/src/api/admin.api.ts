import api from './axios';
import { AuditLog } from './audit.api';

export const adminApi = {
  // Dashboard Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Audit Logs - Just fetch, don't create
  getLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get('/admin/logs');
    return response.data.data || response.data || [];
  },

  // Super Admin Extensions
  getAllUsers: async () => {
    const response = await api.get('/super-admin/users');
    return response.data;
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
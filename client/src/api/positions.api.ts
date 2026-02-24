import api from './axios';
import { Position, ApiResponse } from '../types';

export const positionsApi = {
  // Get all positions for a specific election
  getByElection: async (electionId: number): Promise<Position[]> => {
    try {
      // Try nested route first
      const response = await api.get<ApiResponse<Position[]>>(`/elections/${electionId}/positions`, {
        params: { _t: new Date().getTime() }
      });
      
      // Handle wrapped response format
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.log('Nested route failed, trying query parameter...');
      
      // Fallback to query parameter format
      try {
        const response = await api.get<ApiResponse<Position[]>>('/positions', {
          params: { 
            election_id: electionId,
            _t: new Date().getTime() 
          }
        });
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        return [];
      } catch (secondError) {
        console.error('Both position endpoints failed:', secondError);
        return [];
      }
    }
  },

  // Get single position by ID
  getById: async (positionId: number): Promise<Position | null> => {
    try {
      const response = await api.get<ApiResponse<Position>>(`/positions/${positionId}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching position:', error);
      return null;
    }
  },

  // Create new position
  create: async (electionId: number, title: string): Promise<Position | null> => {
    try {
      // Try POST to /positions first
      const response = await api.post<ApiResponse<Position>>('/positions', {
        election_id: electionId,
        title
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.log('POST to /positions failed, trying nested route...');
      
      // Fallback to nested route
      try {
        const response = await api.post<ApiResponse<Position>>(`/elections/${electionId}/positions`, {
          title
        });
        
        if (response.data && response.data.data) {
          return response.data.data;
        }
        return null;
      } catch (secondError) {
        console.error('Both position creation endpoints failed:', secondError);
        return null;
      }
    }
  },

  // Update position
  update: async (positionId: number, title: string): Promise<Position | null> => {
    try {
      const response = await api.put<ApiResponse<Position>>(`/positions/${positionId}`, {
        title
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating position:', error);
      return null;
    }
  },

  // Delete position
  delete: async (positionId: number): Promise<boolean> => {
    try {
      await api.delete(`/positions/${positionId}`);
      return true;
    } catch (error) {
      console.error('Error deleting position:', error);
      return false;
    }
  }
};
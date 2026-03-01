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
    } catch (error: any) {
      // If it's a real error (like 500) and not a 404, throw it immediately
      if (error.response && error.response.status !== 404) {
        throw error;
      }

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
      } catch (secondError: any) {
        console.error('Both position endpoints failed:', secondError);
        
        // ✨ THE MAGIC FIX ✨
        // If it is a 404, return an empty array instead of crashing
        if (secondError.response && secondError.response.status === 404) {
          return [];
        }
        
        throw secondError; // Throw actual error up to the UI
      }
    }
  },

  // Get single position by ID
  getById: async (positionId: number): Promise<Position> => {
    try {
      const response = await api.get<ApiResponse<Position>>(`/positions/${positionId}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Unexpected response format from server');
    } catch (error) {
      console.error('Error fetching position:', error);
      throw error;
    }
  },

  // Create new position
  create: async (electionId: number, title: string): Promise<Position> => {
    try {
      // Try POST to /positions first
      const response = await api.post<ApiResponse<Position>>('/positions', {
        election_id: electionId,
        title
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Unexpected response format from server');
    } catch (error: any) {
      // If it's a validation error (400) or server error (500), throw it immediately
      if (error.response && error.response.status !== 404) {
         throw error;
      }

      console.log('POST to /positions failed, trying nested route...');
      
      // Fallback to nested route
      try {
        const response = await api.post<ApiResponse<Position>>(`/elections/${electionId}/positions`, {
          title
        });
        
        if (response.data && response.data.data) {
          return response.data.data;
        }
        throw new Error('Unexpected response format from server');
      } catch (secondError) {
        console.error('Both position creation endpoints failed:', secondError);
        throw secondError; // Throw actual error up to the UI
      }
    }
  },

  // Update position
  update: async (positionId: number, title: string): Promise<Position> => {
    try {
      const response = await api.put<ApiResponse<Position>>(`/positions/${positionId}`, {
        title
      });
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Unexpected response format from server');
    } catch (error) {
      console.error('Error updating position:', error);
      throw error; // Throw actual error up to the UI
    }
  },

  // Delete position
  delete: async (positionId: number): Promise<boolean> => {
    try {
      await api.delete(`/positions/${positionId}`);
      return true;
    } catch (error) {
      console.error('Error deleting position:', error);
      throw error; // Throw actual error up to the UI
    }
  }
};
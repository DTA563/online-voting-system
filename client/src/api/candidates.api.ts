import api from './axios';
import { Candidate, ApiResponse } from '../types';

export const candidatesApi = {
  // Get all candidates for a specific position
  getByPosition: async (positionId: number): Promise<Candidate[]> => {
    try {
      // Try nested route first
      const response = await api.get<ApiResponse<Candidate[]>>(`/positions/${positionId}/candidates`, {
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
        const response = await api.get<ApiResponse<Candidate[]>>('/candidates', {
          params: { 
            position_id: positionId,
            _t: new Date().getTime() 
          }
        });
        
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        return [];
      } catch (secondError) {
        console.error('Both candidate endpoints failed:', secondError);
        return [];
      }
    }
  },

  // Get single candidate by ID
  getById: async (candidateId: number): Promise<Candidate | null> => {
    try {
      const response = await api.get<ApiResponse<Candidate>>(`/candidates/${candidateId}`);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      return null;
    }
  },

  // Create new candidate
  create: async (candidateData: {
    position_id: number;
    full_name: string;
    manifesto?: string | null;
    photo_url?: string | null;
  }): Promise<Candidate | null> => {
    try {
      // Try POST to /candidates first
      const response = await api.post<ApiResponse<Candidate>>('/candidates', candidateData);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.log('POST to /candidates failed, trying nested route...');
      
      // Fallback to nested route
      try {
        const response = await api.post<ApiResponse<Candidate>>(
          `/positions/${candidateData.position_id}/candidates`, 
          {
            full_name: candidateData.full_name,
            manifesto: candidateData.manifesto,
            photo_url: candidateData.photo_url
          }
        );
        
        if (response.data && response.data.data) {
          return response.data.data;
        }
        return null;
      } catch (secondError) {
        console.error('Both candidate creation endpoints failed:', secondError);
        return null;
      }
    }
  },

  // Update candidate
  update: async (candidateId: number, candidateData: {
    full_name?: string;
    manifesto?: string | null;
    photo_url?: string | null;
  }): Promise<Candidate | null> => {
    try {
      const response = await api.put<ApiResponse<Candidate>>(`/candidates/${candidateId}`, candidateData);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating candidate:', error);
      return null;
    }
  },

  // Delete candidate
  delete: async (candidateId: number): Promise<boolean> => {
    try {
      await api.delete(`/candidates/${candidateId}`);
      return true;
    } catch (error) {
      console.error('Error deleting candidate:', error);
      return false;
    }
  }
};
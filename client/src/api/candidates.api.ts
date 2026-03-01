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

  // Create new candidate with FormData support
  create: async (candidateData: FormData | {
    position_id: number;
    full_name: string;
    manifesto?: string | null;
    photo_url?: string | null;
  }): Promise<Candidate | null> => {
    try {
      let response;
      
      // Check if candidateData is FormData
      if (candidateData instanceof FormData) {
        // If it's FormData, send directly
        response = await api.post<ApiResponse<Candidate>>('/candidates', candidateData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If it's a plain object, send as JSON
        response = await api.post<ApiResponse<Candidate>>('/candidates', candidateData);
      }
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.log('POST to /candidates failed, trying nested route...');
      
      // Fallback to nested route - handle both FormData and JSON
      try {
        let response;
        
        if (candidateData instanceof FormData) {
          // Extract position_id from FormData for the URL
          const positionId = candidateData.get('position_id');
          
          // Create new FormData without position_id for the nested route
          const nestedFormData = new FormData();
          nestedFormData.append('full_name', candidateData.get('full_name') as string);
          if (candidateData.get('manifesto')) {
            nestedFormData.append('manifesto', candidateData.get('manifesto') as string);
          }
          if (candidateData.get('photo')) {
            nestedFormData.append('photo', candidateData.get('photo') as File);
          }
          if (candidateData.get('photo_url')) {
            nestedFormData.append('photo_url', candidateData.get('photo_url') as string);
          }
          
          response = await api.post<ApiResponse<Candidate>>(
            `/positions/${positionId}/candidates`, 
            nestedFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        } else {
          // For JSON, extract position_id
          const { position_id, ...restData } = candidateData;
          response = await api.post<ApiResponse<Candidate>>(
            `/positions/${position_id}/candidates`, 
            restData
          );
        }
        
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

  // Update candidate with FormData support
  update: async (candidateId: number, candidateData: FormData | {
    full_name?: string;
    manifesto?: string | null;
    photo_url?: string | null;
  }): Promise<Candidate | null> => {
    try {
      let response;
      
      // Check if candidateData is FormData
      if (candidateData instanceof FormData) {
        // If it's FormData, send with proper content type
        response = await api.put<ApiResponse<Candidate>>(`/candidates/${candidateId}`, candidateData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If it's a plain object, send as JSON
        response = await api.put<ApiResponse<Candidate>>(`/candidates/${candidateId}`, candidateData);
      }
      
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
import api from './axios';
import { Election, Position, Candidate, ApiResponse } from '../types';
import { positionsApi } from './positions.api'; // Import positionsApi
import { candidatesApi } from './candidates.api'; // Import candidatesApi

export const electionsApi = {
  // Get all elections
  getAll: async (): Promise<Election[]> => {
    const response = await api.get('/elections', {
      params: { _t: new Date().getTime() }
    });
    
    // Handle both wrapped and unwrapped responses
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Unexpected API response format:', response.data);
      return [];
    }
  },

  // Get active election
  getActive: async (): Promise<Election | null> => {
    const response = await api.get('/elections/active', {
      params: { _t: new Date().getTime() }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    return null;
  },

  // Get election by ID
  getById: async (id: number): Promise<Election> => {
    const response = await api.get(`/elections/${id}`, {
      params: { _t: new Date().getTime() }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Get positions for an election - Now delegates to positionsApi
  getPositions: async (electionId: number): Promise<Position[]> => {
    return positionsApi.getByElection(electionId);
  },

  // Get candidates for a position
   getCandidates: async (positionId: number): Promise<Candidate[]> => {
    return candidatesApi.getByPosition(positionId);
  },

  // Admin: Create election
  create: async (election: Omit<Election, 'election_id' | 'created_at'>): Promise<Election> => {
    const response = await api.post('/elections', election);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Admin: Update election
  update: async (id: number, election: Partial<Election>): Promise<Election> => {
    const response = await api.put(`/elections/${id}`, election);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Admin: Delete election
  delete: async (id: number): Promise<void> => {
    await api.delete(`/elections/${id}`);
  },

  // Admin: Upload voter registry for an election
  uploadVoterRegistry: async (electionId: number, userIds: string[]): Promise<{ message: string }> => {
    const response = await api.post('/admin/registry/register', { electionId, userIds });
    return response.data;
  },
};
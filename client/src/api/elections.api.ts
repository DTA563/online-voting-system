import api from './axios';
import { Election, Position, Candidate, ApiResponse } from '../types';

export const electionsApi = {
  // Get all elections
  getAll: async (): Promise<Election[]> => {
    const response = await api.get<ApiResponse<Election[]>>('/elections');
    return response.data.data || [];
  },

  // Get active election
  getActive: async (): Promise<Election | null> => {
    const response = await api.get<ApiResponse<Election>>('/elections/active');
    return response.data.data || null;
  },

  // Get election by ID
  getById: async (id: number): Promise<Election> => {
    const response = await api.get<ApiResponse<Election>>(`/elections/${id}`);
    return response.data.data!;
  },

  // Get positions for an election
  getPositions: async (electionId: number): Promise<Position[]> => {
    const response = await api.get<ApiResponse<Position[]>>(`/elections/${electionId}/positions`);
    return response.data.data || [];
  },

  // Get candidates for a position
  getCandidates: async (positionId: number): Promise<Candidate[]> => {
    const response = await api.get<ApiResponse<Candidate[]>>(`/positions/${positionId}/candidates`);
    return response.data.data || [];
  },

  // Admin: Create election
  create: async (election: Omit<Election, 'election_id' | 'created_at'>): Promise<Election> => {
    const response = await api.post<ApiResponse<Election>>('/elections', election);
    return response.data.data!;
  },

  // Admin: Update election
  update: async (id: number, election: Partial<Election>): Promise<Election> => {
    const response = await api.put<ApiResponse<Election>>(`/elections/${id}`, election);
    return response.data.data!;
  },

  // Admin: Delete election
  delete: async (id: number): Promise<void> => {
    await api.delete(`/elections/${id}`);
  },
};

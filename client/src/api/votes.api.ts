import api from './axios';
import { VoteSubmission, PositionResult, VoterStatus, ApiResponse } from '../types';

export const votesApi = {
  // Submit vote
  castVote: async (vote: VoteSubmission): Promise<{ message: string }> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/votes/cast', vote);
    return response.data.data!;
  },

  // Check if user has voted in an election
  checkVoterStatus: async (electionId: number): Promise<VoterStatus> => {
    const response = await api.get<ApiResponse<VoterStatus>>(`/votes/status/${electionId}`);
    return response.data.data!;
  },

  // Get results for an election
  getResults: async (electionId: number): Promise<PositionResult[]> => {
    const response = await api.get<ApiResponse<PositionResult[]>>(`/results/${electionId}`);
    return response.data.data || [];
  },

  // Get voter turnout stats
  getTurnout: async (electionId: number | string | undefined): Promise<{ total: number; voted: number; percentage: number }> => {
    // SAFETY GUARD: Prevent calling /undefined
    if (!electionId || electionId === 'undefined') {
      return { total: 0, voted: 0, percentage: 0 };
    }

    const response = await api.get<ApiResponse<{ total: number; voted: number; percentage: number }>>(
      `/votes/turnout/${electionId}`
    );
    
    // Ensure we return the 'data' property to satisfy the frontend caller
    return response.data.data!;
  },
};

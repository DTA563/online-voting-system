import api from './axios';
import { VoteSubmission, PositionResult, VoterStatus, ApiResponse } from '../types';

export const votesApi = {
  /**
   * Submit vote
   * Submits the full multi-position ballot to the backend.
   */
  castVote: async (vote: VoteSubmission): Promise<{ message: string }> => {
    const response = await api.post<ApiResponse<{ message: string }>>('/votes/cast', vote);
    return response.data.data!;
  },

  /**
   * Check if user has voted in an election
   * Performs the handshake to check eligibility and previous participation.
   */
  checkVoterStatus: async (electionId: number): Promise<VoterStatus> => {
    const response = await api.get<ApiResponse<VoterStatus>>(`/votes/status/${electionId}`);
    return response.data.data!;
  },

  /**
   * getResults
   * Fetches the candidate tallies.
   * FIX: Backend now provides Turnout and Tally in one call.
   * We extract the 'results' array from that combined object.
   */
  getResults: async (electionId: number): Promise<PositionResult[]> => {
    const response = await api.get<ApiResponse<any>>(`/results/${electionId}`);
    // Extract the nested structured array from the data object
    return response.data.data?.results || [];
  },

  /**
   * getTurnout
   * Fetches the voter participation statistics.
   * FIX: We use the unified results endpoint but return the top-level stats.
   */
  getTurnout: async (electionId: number | string | undefined): Promise<{ total: number; voted: number; percentage: number }> => {
    // SAFETY GUARD: Prevent calling /undefined
    if (!electionId || electionId === 'undefined') {
      return { total: 0, voted: 0, percentage: 0 };
    }

    const response = await api.get<ApiResponse<any>>(`/results/${electionId}`);
    const d = response.data.data;
    
    return {
      total: d?.total || 0,
      voted: d?.voted || 0,
      percentage: d?.percentage || 0
    };
  },
};
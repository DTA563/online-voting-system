// User types (from users table)
export interface User {
  user_id: string;
  full_name: string;
  role: 'voter' | 'admin';
}

export interface LoginCredentials {
  userId: string;  // ✅ Changed from user_id to userId
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Election types (from elections table)
export interface Election {
  election_id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  created_at?: string;
}

// Position types (from positions table)
export interface Position {
  position_id: number;
  election_id: number;
  title: string;
}

// Candidate types (from candidates table)
export interface Candidate {
  candidate_id: number;
  full_name: string;
  position_id: number;
  manifesto?: string;
  photo_url?: string;
}

// Voter status (from voter_status table)
export interface VoterStatus {
  user_id: string;
  election_id: number;
  has_voted: boolean;
  voted_at?: string;
}

// Vote submission
export interface VoteSubmission {
  election_id: number;
  votes: {
    position_id: number;
    candidate_id: number;
  }[];
}

// Results display
export interface VoteResult {
  candidate_id: number;
  candidate_name: string;
  position_id: number;
  position_title: string;
  vote_count: number;
}

export interface PositionResult {
  position_id: number;
  position_title: string;
  candidates: {
    candidate_id: number;
    candidate_name: string;
    vote_count: number;
    percentage: number;
  }[];
  total_votes: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
export type UserRole = "commuter" | "driver" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_admin: boolean;
  preferred_max_walk_km: number;
  preferred_time_window_minutes: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Ride {
  id: number;
  driver_id: number;
  source: string;
  source_lat: number;
  source_lng: number;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  departure_time: string;
  available_seats: number;
  status: string;
  created_at?: string;
}

export interface Booking {
  id: number;
  ride_id: number;
  user_id: number;
  status: string;
  created_at: string;
}

export interface RecommendationScore {
  total: number;
  source_distance_km: number;
  destination_distance_km: number;
  time_delta_minutes: number;
  source_score: number;
  destination_score: number;
  time_score: number;
  history_score: number;
  reason: string;
}

export interface RideRecommendation {
  ride_id: number;
  driver_id: number;
  source: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  score: RecommendationScore;
}

export interface AdminAnalytics {
  users: number;
  active_rides: number;
  bookings: number;
  open_requests: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  preferred_max_walk_km?: number;
  preferred_time_window_minutes?: number;
  admin_key?: string;
}

export interface RecommendationPayload {
  source: string;
  destination: string;
  departure_time: string;
  max_walk_km?: number;
  time_window_minutes?: number;
  limit?: number;
}

export interface CreateRidePayload {
  source: string;
  destination: string;
  departure_time: string;
  available_seats: number;
}

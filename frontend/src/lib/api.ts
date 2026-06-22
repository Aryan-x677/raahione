import type {
  AdminAnalytics,
  Booking,
  CreateRidePayload,
  RecommendationPayload,
  RegisterPayload,
  Ride,
  RideRecommendation,
  TokenResponse,
  User,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "raahione_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body?.detail ?? body?.error?.message ?? message;
      if (Array.isArray(body?.detail)) {
        message = body.detail.map((e: { msg?: string }) => e.msg).join(", ");
      }
    } catch {
      /* ignore parse errors */
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register(payload: RegisterPayload) {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, password: string): Promise<User> {
    const token = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(token.access_token);
    return api.me();
  },

  me() {
    return request<User>("/auth/me");
  },

  logout() {
    clearToken();
  },

  listRides(params?: { source?: string; destination?: string; limit?: number }) {
    const search = new URLSearchParams();
    if (params?.source) search.set("source", params.source);
    if (params?.destination) search.set("destination", params.destination);
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return request<Ride[]>(`/rides${qs ? `?${qs}` : ""}`);
  },

  getRide(rideId: number) {
    return request<Ride>(`/rides/${rideId}`);
  },

  createRide(payload: CreateRidePayload) {
    return request<Ride>("/rides/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  bookRide(rideId: number) {
    return request<Booking>(`/rides/${rideId}/book`, { method: "POST" });
  },

  myBookings() {
    return request<Booking[]>("/bookings/me");
  },

  cancelBooking(bookingId: number) {
    return request<Booking>(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
  },

  recommendations(payload: RecommendationPayload) {
    return request<RideRecommendation[]>("/recommendations/rides", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  rateRide(rideId: number, score: number, comment?: string) {
    return request(`/ratings/rides/${rideId}`, {
      method: "POST",
      body: JSON.stringify({ score, comment: comment ?? null }),
    });
  },

  adminAnalytics() {
    return request<AdminAnalytics>("/admin/analytics");
  },
};

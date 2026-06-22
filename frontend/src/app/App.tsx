import { useState, useEffect, useRef } from "react";
import {
  Home, Search, BookOpen, Clock, User, Car, MapPin, Calendar, Users,
  Star, Bell, Menu, X, ChevronRight, Filter, Plus, LogOut, TrendingUp,
  BarChart2, Shield, Eye, EyeOff, Mail, CheckCircle, AlertCircle,
  ArrowRight, DollarSign, Zap, ThumbsUp, Edit, Trash2, Activity,
  LayoutDashboard, UserCheck, Navigation, Phone, Award, Heart,
  ChevronDown, ChevronLeft, Cpu, Check, Settings, Leaf, RefreshCw,
  Download, MoreHorizontal, XCircle, Info, Bookmark, Share2, MessageSquare
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from "recharts";
import { useAuth } from "../lib/auth";
import { api, ApiError } from "../lib/api";
import { SAMPLE_LOCATIONS } from "../lib/geocode";
import { formatDateTime, initials, toApiDateTime } from "../lib/format";
import type { Booking as ApiBooking, Ride as ApiRide, RideRecommendation } from "../lib/types";
import { ApiRideCard, bookingStatusLabel } from "./components/ApiRideCard";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Screen =
  | "landing" | "login" | "register"
  | "dashboard" | "search" | "ride-detail" | "offer"
  | "bookings" | "profile"
  | "driver" | "recommendations" | "admin";
type AdminTab = "overview" | "users" | "rides" | "analytics";
interface Driver { id: number; name: string; rating: number; trips: number; initials: string; verified: boolean; vehicle: string; plate: string; phone: string; bio: string; joinedYear: number; }
interface Ride { id: number; from: string; to: string; date: string; time: string; seats: number; totalSeats: number; price: number; driver: Driver; duration: string; distance: string; amenities: string[]; }
type Navigate = (screen: Screen, extra?: unknown) => void;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const DRIVERS: Driver[] = [
  { id: 1, name: "Arjun Sharma", rating: 4.8, trips: 234, initials: "AS", verified: true, vehicle: "Maruti Swift Dzire (Silver)", plate: "DL 01 AB 1234", phone: "+91 98765 43210", bio: "Daily commuter to Cyber City. Punctual, non-smoker, love good conversations.", joinedYear: 2023 },
  { id: 2, name: "Priya Mehta", rating: 4.9, trips: 189, initials: "PM", verified: true, vehicle: "Honda City (White)", plate: "MH 12 CD 5678", phone: "+91 98765 11111", bio: "Software engineer heading Andheri every morning. Relaxed drives, good music.", joinedYear: 2022 },
  { id: 3, name: "Rahul Gupta", rating: 4.7, trips: 312, initials: "RG", verified: true, vehicle: "Hyundai i20 (Black)", plate: "KA 05 EF 9012", phone: "+91 98765 22222", bio: "Tech professional going Whitefield daily. Verified, rated 4.7 by 300+ riders.", joinedYear: 2021 },
  { id: 4, name: "Sneha Patel", rating: 4.6, trips: 156, initials: "SP", verified: false, vehicle: "Tata Nexon EV (Blue)", plate: "GJ 01 GH 3456", phone: "+91 98765 33333", bio: "Eco-conscious commuter with electric vehicle. Smooth, quiet rides guaranteed.", joinedYear: 2024 },
];
const RIDES: Ride[] = [
  { id: 1, from: "Connaught Place, Delhi", to: "Cyber City, Gurgaon", date: "Jun 22, 2025", time: "08:30 AM", seats: 3, totalSeats: 4, price: 180, driver: DRIVERS[0], duration: "45 min", distance: "28 km", amenities: ["AC", "Music", "No Smoking"] },
  { id: 2, from: "Bandra, Mumbai", to: "Andheri East, Mumbai", date: "Jun 22, 2025", time: "09:00 AM", seats: 2, totalSeats: 3, price: 120, driver: DRIVERS[1], duration: "35 min", distance: "12 km", amenities: ["AC", "Female Friendly"] },
  { id: 3, from: "Koramangala, Bangalore", to: "Whitefield, Bangalore", date: "Jun 23, 2025", time: "07:45 AM", seats: 1, totalSeats: 4, price: 200, driver: DRIVERS[2], duration: "55 min", distance: "22 km", amenities: ["AC", "Wifi", "No Pets"] },
  { id: 4, from: "Salt Lake, Kolkata", to: "Rajarhat, Kolkata", date: "Jun 24, 2025", time: "10:00 AM", seats: 4, totalSeats: 4, price: 90, driver: DRIVERS[3], duration: "30 min", distance: "10 km", amenities: ["EV", "AC"] },
  { id: 5, from: "Lajpat Nagar, Delhi", to: "Noida Sector 18", date: "Jun 25, 2025", time: "08:00 AM", seats: 2, totalSeats: 3, price: 160, driver: DRIVERS[0], duration: "50 min", distance: "25 km", amenities: ["AC", "Music"] },
  { id: 6, from: "Powai, Mumbai", to: "BKC, Mumbai", date: "Jun 25, 2025", time: "09:30 AM", seats: 3, totalSeats: 4, price: 110, driver: DRIVERS[1], duration: "40 min", distance: "15 km", amenities: ["AC", "No Smoking"] },
];
const ANALYTICS = {
  trend: [
    { month: "Jan", rides: 1200, users: 340, revenue: 216000 },
    { month: "Feb", rides: 1800, users: 520, revenue: 324000 },
    { month: "Mar", rides: 2400, users: 780, revenue: 432000 },
    { month: "Apr", rides: 2100, users: 920, revenue: 378000 },
    { month: "May", rides: 3200, users: 1150, revenue: 576000 },
    { month: "Jun", rides: 3800, users: 1420, revenue: 684000 },
  ],
  routes: [
    { name: "Delhi → Gurgaon", value: 35 },
    { name: "Mumbai Suburbs", value: 28 },
    { name: "Bangalore Corridor", value: 22 },
    { name: "Others", value: 15 },
  ],
  weekly: [
    { day: "Mon", rides: 620 }, { day: "Tue", rides: 740 }, { day: "Wed", rides: 690 },
    { day: "Thu", rides: 820 }, { day: "Fri", rides: 940 }, { day: "Sat", rides: 380 }, { day: "Sun", rides: 290 },
  ],
  satisfaction: [{ name: "Rating", value: 92, fill: "#2563EB" }],
};
const USERS_TABLE = [
  { id: "U001", name: "Amit Srivastava", email: "amit.sriv@gmail.com", role: "Rider", rides: 23, rating: 4.7, joined: "Jan 15, 2025", status: "active", city: "Delhi" },
  { id: "U002", name: "Kavya Reddy", email: "kavya.r@gmail.com", role: "Driver", rides: 78, rating: 4.9, joined: "Feb 20, 2025", status: "active", city: "Bangalore" },
  { id: "U003", name: "Deepak Joshi", email: "deepak.j@yahoo.com", role: "Rider", rides: 12, rating: 3.2, joined: "Mar 10, 2025", status: "suspended", city: "Mumbai" },
  { id: "U004", name: "Ritu Singh", email: "ritu.s@outlook.com", role: "Driver", rides: 145, rating: 4.8, joined: "Jan 5, 2025", status: "active", city: "Delhi" },
  { id: "U005", name: "Varun Agarwal", email: "varun.ag@gmail.com", role: "Rider", rides: 34, rating: 4.5, joined: "Apr 18, 2025", status: "active", city: "Noida" },
  { id: "U006", name: "Ishaan Kapoor", email: "ishaan.k@gmail.com", role: "Both", rides: 58, rating: 4.6, joined: "May 22, 2025", status: "active", city: "Gurgaon" },
  { id: "U007", name: "Pooja Nair", email: "pooja.n@gmail.com", role: "Rider", rides: 19, rating: 4.8, joined: "Jun 1, 2025", status: "active", city: "Kochi" },
];
const ADMIN_RIDES_TABLE = [
  { id: "R001", from: "CP, Delhi", to: "Cyber City", driver: "Arjun Sharma", status: "active", passengers: 2, date: "Jun 21, 2025", amount: 360 },
  { id: "R002", from: "Bandra", to: "Andheri", driver: "Priya Mehta", status: "completed", passengers: 3, date: "Jun 21, 2025", amount: 360 },
  { id: "R003", from: "Koramangala", to: "Whitefield", driver: "Rahul Gupta", status: "cancelled", passengers: 0, date: "Jun 20, 2025", amount: 0 },
  { id: "R004", from: "Salt Lake", to: "Rajarhat", driver: "Sneha Patel", status: "active", passengers: 1, date: "Jun 21, 2025", amount: 90 },
  { id: "R005", from: "Lajpat Nagar", to: "Noida Sec 18", driver: "Arjun Sharma", status: "completed", passengers: 2, date: "Jun 20, 2025", amount: 320 },
  { id: "R006", from: "Powai", to: "BKC", driver: "Priya Mehta", status: "scheduled", passengers: 3, date: "Jun 22, 2025", amount: 330 },
];
const BOOKINGS = [
  { id: "BK001", from: "Connaught Place, Delhi", to: "Cyber City, Gurgaon", date: "Jun 22, 2025", time: "08:30 AM", driver: DRIVERS[0], status: "confirmed", amount: 180, seats: 1 },
  { id: "BK002", from: "Bandra, Mumbai", to: "Andheri East, Mumbai", date: "Jun 25, 2025", time: "09:00 AM", driver: DRIVERS[1], status: "pending", amount: 120, seats: 1 },
  { id: "BK003", from: "Koramangala, Bangalore", to: "Whitefield, Bangalore", date: "Jun 10, 2025", time: "07:45 AM", driver: DRIVERS[2], status: "completed", amount: 200, seats: 1 },
  { id: "BK004", from: "Salt Lake, Kolkata", to: "Rajarhat, Kolkata", date: "Jun 5, 2025", time: "10:00 AM", driver: DRIVERS[3], status: "cancelled", amount: 90, seats: 2 },
  { id: "BK005", from: "Lajpat Nagar, Delhi", to: "Noida Sector 18", date: "Jun 15, 2025", time: "08:00 AM", driver: DRIVERS[0], status: "completed", amount: 160, seats: 1 },
];
const TESTIMONIALS = [
  { name: "Aditya Kumar", role: "Software Engineer, Noida", text: "RaahiOne transformed my daily Noida–Gurgaon commute. Cut my travel cost by 65% and I made genuine friends along the way!", rating: 5, initials: "AK", city: "Delhi NCR", rides: 47 },
  { name: "Nisha Verma", role: "MBA Student, IIM-L", text: "As a student, every rupee matters. RaahiOne is a lifesaver — safe, verified rides at a fraction of Ola/Uber. Absolutely love it!", rating: 5, initials: "NV", city: "Lucknow", rides: 23 },
  { name: "Manish Tiwari", role: "Marketing Manager, Delhi", text: "I've been using this daily for 6 months. The AI recommendations are spot-on — it knows my schedule better than I do!", rating: 5, initials: "MT", city: "Gurgaon", rides: 128 },
];
const RECS = [
  { ride: RIDES[0], score: 96, tag: "Perfect Match", reasons: ["Matches your regular Mon–Fri route", "Preferred 8–9 AM window", "Top-rated driver (4.8★, 234 trips)", "Saved this route 3 times"] },
  { ride: RIDES[4], score: 88, tag: "Cost Saver", reasons: ["Similar to your last 5 bookings", "Budget-friendly at ₹160/seat", "Verified driver, 98% acceptance rate", "Departs from 0.4 km from your home"] },
  { ride: RIDES[2], score: 81, tag: "Popular Route", reasons: ["Trending on Koramangala corridor", "Last 1 seat — book before it fills!", "Wifi available on this ride", "4.7★ driver with 312 trips"] },
];
const DRIVER_REQUESTS = [
  { id: "DR001", passenger: "Rohan S.", initials: "RS", rating: 4.6, from: "CP, Delhi", to: "Cyber City", seats: 1, time: "08:30 AM", joined: "2024" },
  { id: "DR002", passenger: "Meera T.", initials: "MT", rating: 4.9, from: "CP, Delhi", to: "Cyber City", seats: 2, time: "08:30 AM", joined: "2023" },
];
const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];
const ACHIEVEMENTS = [
  { icon: "🚗", label: "First Ride", desc: "Completed your first ride", earned: true },
  { icon: "⭐", label: "5-Star Rider", desc: "Maintained 4.9+ rating", earned: true },
  { icon: "🌿", label: "Eco Warrior", desc: "Saved 40+ kg CO₂", earned: true },
  { icon: "💯", label: "Century Club", desc: "Complete 100 rides", earned: false },
  { icon: "🤝", label: "Community Hero", desc: "Refer 10 friends", earned: false },
  { icon: "🏆", label: "Top Commuter", desc: "Ride daily for 30 days", earned: false },
];
const NOTIFICATIONS = [
  { id: 1, icon: "🚗", text: "Arjun Sharma accepted your booking BK001", time: "2 min ago", unread: true },
  { id: 2, icon: "⭐", text: "Priya Mehta rated you 5 stars! Great rider.", time: "1 hr ago", unread: true },
  { id: 3, icon: "💡", text: "3 new AI recommendations for your Tuesday commute", time: "3 hr ago", unread: false },
  { id: 4, icon: "✅", text: "Your ride BK003 has been completed. Rate your driver!", time: "Yesterday", unread: false },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function cn(...c: (string | false | undefined | null)[]): string { return c.filter(Boolean).join(" "); }

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
function Avatar({ initials, size = "md", online }: { initials: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; online?: boolean }) {
  const s = { xs: "w-6 h-6 text-[10px]", sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base", xl: "w-20 h-20 text-xl" };
  const palettes: Record<string, string> = {
    A: "bg-blue-100 text-blue-700", B: "bg-emerald-100 text-emerald-700", C: "bg-purple-100 text-purple-700",
    D: "bg-orange-100 text-orange-700", E: "bg-rose-100 text-rose-700", F: "bg-cyan-100 text-cyan-700",
    G: "bg-amber-100 text-amber-700", H: "bg-indigo-100 text-indigo-700", I: "bg-teal-100 text-teal-700",
    J: "bg-pink-100 text-pink-700", K: "bg-violet-100 text-violet-700", L: "bg-lime-100 text-lime-700",
    M: "bg-sky-100 text-sky-700", N: "bg-red-100 text-red-700", O: "bg-fuchsia-100 text-fuchsia-700",
    P: "bg-green-100 text-green-700", Q: "bg-yellow-100 text-yellow-700", R: "bg-blue-200 text-blue-800",
    S: "bg-emerald-200 text-emerald-800", V: "bg-purple-200 text-purple-800",
  };
  const color = palettes[initials[0]] ?? "bg-slate-100 text-slate-700";
  return (
    <div className="relative inline-flex shrink-0">
      <div className={cn("rounded-full flex items-center justify-center font-bold", s[size], color)}>{initials}</div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />}
    </div>
  );
}

function Stars({ rating, showCount = true }: { rating: number; showCount?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : i - 0.5 <= rating ? "fill-amber-300 text-amber-300" : "fill-gray-200 text-gray-200")} />
      ))}
      {showCount && <span className="text-xs text-slate-500 ml-1 font-semibold">{rating}</span>}
    </div>
  );
}

function Pill({ children, variant = "default", dot }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "blue"; dot?: boolean }) {
  const v = {
    default: "bg-slate-100 text-slate-600 border-transparent",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const dotColor = { default: "bg-slate-400", success: "bg-emerald-500", warning: "bg-amber-500", danger: "bg-red-500", info: "bg-sky-500", purple: "bg-purple-500", blue: "bg-blue-500" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border", v[variant])}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColor[variant])} />}
      {children}
    </span>
  );
}

function Btn({ children, variant = "primary", size = "md", full = false, className = "", onClick, type = "button", disabled, loading }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white" | "soft";
  size?: "xs" | "sm" | "md" | "lg"; full?: boolean; className?: string;
  onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; loading?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none shrink-0";
  const sz = { xs: "px-3 py-1.5 text-xs", sm: "px-4 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };
  const vr = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-blue-200 hover:shadow-md active:scale-[0.97]",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-emerald-200 hover:shadow-md active:scale-[0.97]",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-[0.97]",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.97]",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97] shadow-sm",
    white: "bg-white text-blue-700 hover:bg-blue-50 shadow-md active:scale-[0.97]",
    soft: "bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.97]",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={cn(base, sz[size], vr[variant], full && "w-full", (disabled || loading) && "opacity-50 cursor-not-allowed", className)}>
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function FormInput({ label, type = "text", placeholder, icon, value, onChange, className = "", helper, required }: {
  label?: string; type?: string; placeholder?: string; icon?: React.ReactNode;
  value?: string; onChange?: (v: string) => void; className?: string; helper?: string; required?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-semibold text-slate-700">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
          className={cn("w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-900",
            icon && "pl-11")} />
      </div>
      {helper && <p className="text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

function Card({ children, className = "", hover = false, onClick }: { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", hover && "hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer", className)}>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendUp = true, color = "blue", sub }: {
  label: string; value: string; icon: React.ReactNode; trend?: string; trendUp?: boolean; color?: "blue" | "green" | "purple" | "orange" | "red"; sub?: string;
}) {
  const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", purple: "bg-purple-50 text-purple-600", orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600" };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-3 rounded-xl", colors[color])}>{icon}</div>
        {trend && (
          <span className={cn("text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full", trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50")}>
            <TrendingUp className={cn("w-3 h-3", !trendUp && "rotate-180")} />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 font-display mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </Card>
  );
}

function SectionHeader({ title, action, actionLabel }: { title: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-black text-slate-900 font-display">{title}</h2>
      {action && actionLabel && (
        <button onClick={action} className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
          {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function RideCardFull({ ride, onBook, onView, compact = false }: { ride: Ride; onBook?: () => void; onView?: () => void; compact?: boolean }) {
  const seatPct = ((ride.totalSeats - ride.seats) / ride.totalSeats) * 100;
  return (
    <Card hover onClick={onView} className="overflow-hidden">
      {!compact && <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${seatPct}%`, minWidth: 0 }} />}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar initials={ride.driver.initials} size="md" online={ride.driver.verified} />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-slate-900 text-sm leading-tight">{ride.driver.name}</p>
                {ride.driver.verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </div>
              <Stars rating={ride.driver.rating} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-blue-600 font-display">₹{ride.price}</p>
            <p className="text-[10px] text-slate-400 font-medium">per seat</p>
          </div>
        </div>

        <div className="relative pl-4 space-y-2 mb-3">
          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-full" />
          <div className="flex items-center gap-2 text-sm">
            <div className="absolute left-[-3px] w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            <span className="text-slate-700 font-medium leading-tight ml-1">{ride.from}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="absolute left-[-3px] w-2 h-2 bg-blue-500 rounded-full border-2 border-white bottom-[6px]" style={{ bottom: 6 }} />
            <span className="text-slate-700 font-medium leading-tight ml-1">{ride.to}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ride.time}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ride.date}</span>
          <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{ride.distance}</span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Users className="w-3 h-3" />
            <span>{ride.seats} of {ride.totalSeats} left</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {ride.amenities.map(a => (
            <span key={a} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600">{a}</span>
          ))}
        </div>

        {onBook && (
          <div className="flex gap-2">
            <Btn full size="sm" onClick={e => { e?.stopPropagation?.(); onBook(); }}>
              Book Seat <ArrowRight className="w-3.5 h-3.5" />
            </Btn>
            <button onClick={e => { e?.stopPropagation?.(); }} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button onClick={e => { e?.stopPropagation?.(); }} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function RatingModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: number) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display">Rate your ride</h3>
          <p className="text-slate-500 text-sm mt-1">with Arjun Sharma · Jun 22</p>
        </div>
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)}
              className="transition-transform hover:scale-110">
              <Star className={cn("w-10 h-10 transition-colors", (hover || rating) >= i ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-center text-sm font-bold text-slate-700 mb-4">{labels[rating]}</p>}
        <textarea placeholder="Add a comment (optional)..." value={comment} onChange={e => setComment(e.target.value)} rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none mb-4" />
        <div className="flex gap-3">
          <Btn variant="ghost" full onClick={onClose}>Skip</Btn>
          <Btn full disabled={rating === 0} onClick={() => { onSubmit(rating); onClose(); }}>Submit Rating</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ navigate }: { navigate: Navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [count, setCount] = useState({ users: 0, rides: 0, cities: 0 });

  useEffect(() => {
    const targets = { users: 52000, rides: 2100000, cities: 28 };
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = step / steps;
      const ease = 1 - Math.pow(1 - p, 3);
      setCount({
        users: Math.round(targets.users * ease),
        rides: Math.round(targets.rides * ease),
        cities: Math.round(targets.cities * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M+` : n >= 1000 ? `${(n / 1000).toFixed(0)}K+` : `${n}+`;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("landing")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 font-display">Raahi<span className="text-blue-600">One</span></span>
          </button>
          <div className="hidden md:flex items-center gap-7">
            {["Features", "How it works", "Safety", "For Drivers"].map(item => (
              <a key={item} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">{item}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Btn size="sm" variant="ghost" onClick={() => navigate("login")}>Log in</Btn>
            <Btn size="sm" onClick={() => navigate("register")}>Get started free</Btn>
          </div>
          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2">
            {["Features", "How it works", "Safety", "For Drivers"].map(item => (
              <a key={item} className="block py-2 text-sm font-medium text-slate-600 hover:text-blue-600 cursor-pointer">{item}</a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-100 mt-3">
              <Btn full variant="outline" size="sm" onClick={() => navigate("login")}>Log in</Btn>
              <Btn full size="sm" onClick={() => navigate("register")}>Sign up</Btn>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-16 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 min-h-screen flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-3xl" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-24 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-7 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 font-bold text-xs">LIVE</span>
              </div>
              <span className="text-white/80 text-sm font-medium">3,847 active rides right now across India</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-7 font-display">
              Smarter Commutes,<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Together.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-9 max-w-lg">
              India&apos;s most trusted ride-sharing community. Connect with verified co-passengers on your daily route — safe, affordable, and sustainable.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-10">
              {[
                { val: fmt(count.users), lbl: "Happy Riders" },
                { val: fmt(count.rides), lbl: "Rides Shared" },
                { val: `${count.cities}`, lbl: "Cities" },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <p className="text-2xl font-black text-white font-display tabular-nums">{val}</p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Btn size="lg" variant="white" onClick={() => navigate("register")} className="font-black">
                Start Riding Free <ArrowRight className="w-4 h-4" />
              </Btn>
              <Btn size="lg" variant="outline" onClick={() => navigate("offer")} className="!border-white/30 !text-white hover:!bg-white/10 font-semibold">
                <Car className="w-4 h-4" /> Offer a Ride
              </Btn>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              {[
                { icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />, text: "ID Verified Drivers" },
                { icon: <Star className="w-3.5 h-3.5 text-amber-400" />, text: "4.8★ Average Rating" },
                { icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" />, text: "Eco-friendly Travel" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  {icon}{text}
                </div>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Car illustration */}
              <svg viewBox="0 0 480 360" className="w-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                {/* Road */}
                <rect x="0" y="290" width="480" height="70" fill="#1e293b" rx="0" />
                <rect x="0" y="288" width="480" height="8" fill="#334155" />
                {[0,1,2,3,4,5].map(i => <rect key={i} x={20 + i * 90} y="318" width="55" height="7" fill="white" opacity="0.2" rx="3" />)}
                {/* Car body */}
                <rect x="80" y="205" width="320" height="92" fill="#2563EB" rx="18" />
                {/* Car roof */}
                <rect x="130" y="152" width="220" height="68" fill="#1d4ed8" rx="22" />
                {/* Bumpers */}
                <rect x="72" y="250" width="20" height="35" fill="#1e40af" rx="8" />
                <rect x="388" y="250" width="20" height="35" fill="#1e40af" rx="8" />
                {/* Windows */}
                <rect x="138" y="160" width="88" height="52" fill="#BAE6FD" rx="12" opacity="0.9" />
                <rect x="238" y="160" width="88" height="52" fill="#BAE6FD" rx="12" opacity="0.9" />
                {/* Window reflections */}
                <rect x="145" y="165" width="20" height="3" fill="white" opacity="0.5" rx="2" />
                <rect x="245" y="165" width="20" height="3" fill="white" opacity="0.5" rx="2" />
                {/* People in car */}
                <circle cx="180" cy="162" r="18" fill="#f97316" />
                <ellipse cx="180" cy="152" rx="13" ry="16" fill="#fed7aa" />
                <circle cx="280" cy="162" r="18" fill="#7c3aed" />
                <ellipse cx="280" cy="152" rx="13" ry="16" fill="#ddd6fe" />
                {/* Wheels */}
                <circle cx="155" cy="302" r="32" fill="#0f172a" />
                <circle cx="155" cy="302" r="20" fill="#1e293b" />
                <circle cx="155" cy="302" r="10" fill="#475569" />
                <circle cx="325" cy="302" r="32" fill="#0f172a" />
                <circle cx="325" cy="302" r="20" fill="#1e293b" />
                <circle cx="325" cy="302" r="10" fill="#475569" />
                {/* Hubcaps */}
                {[0,1,2,3].map(i => <rect key={i} x={155 + 14 * Math.cos(i * Math.PI/2) - 3} y={302 + 14 * Math.sin(i * Math.PI/2) - 3} width="6" height="6" fill="#94a3b8" rx="3" />)}
                {[0,1,2,3].map(i => <rect key={i} x={325 + 14 * Math.cos(i * Math.PI/2) - 3} y={302 + 14 * Math.sin(i * Math.PI/2) - 3} width="6" height="6" fill="#94a3b8" rx="3" />)}
                {/* Headlights */}
                <rect x="388" y="225" width="14" height="22" fill="#FEF08A" rx="7" />
                <rect x="390" y="225" width="8" height="22" fill="#FDE047" rx="5" opacity="0.8" />
                {/* Taillights */}
                <rect x="78" y="225" width="14" height="22" fill="#FCA5A5" rx="7" />
                {/* Door lines */}
                <line x1="240" y1="208" x2="240" y2="295" stroke="#1d4ed8" strokeWidth="2" opacity="0.5" />
                <line x1="160" y1="220" x2="160" y2="290" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.3" />
                <line x1="320" y1="220" x2="320" y2="290" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.3" />
                {/* License plate */}
                <rect x="188" y="284" width="104" height="22" fill="white" rx="4" />
                <text x="240" y="299" textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="bold" fontFamily="monospace">DL 01 AB 1234</text>
                {/* Trees */}
                <rect x="18" y="215" width="10" height="78" fill="#15803d" rx="4" />
                <ellipse cx="23" cy="200" rx="25" ry="32" fill="#16a34a" />
                <ellipse cx="23" cy="190" rx="18" ry="22" fill="#22c55e" opacity="0.6" />
                <rect x="448" y="215" width="10" height="78" fill="#15803d" rx="4" />
                <ellipse cx="453" cy="200" rx="25" ry="32" fill="#16a34a" />
                <ellipse cx="453" cy="190" rx="18" ry="22" fill="#22c55e" opacity="0.6" />
                {/* Sky elements */}
                <circle cx="400" cy="50" r="32" fill="#FDE047" opacity="0.8" />
                {[0,45,90,135,180,225,270,315].map((a, i) => (
                  <line key={i} x1={400 + 37 * Math.cos(a * Math.PI/180)} y1={50 + 37 * Math.sin(a * Math.PI/180)} x2={400 + 46 * Math.cos(a * Math.PI/180)} y2={50 + 46 * Math.sin(a * Math.PI/180)} stroke="#FDE047" strokeWidth="2.5" opacity="0.5" />
                ))}
                {/* Clouds */}
                <ellipse cx="100" cy="70" rx="40" ry="22" fill="white" opacity="0.6" />
                <ellipse cx="135" cy="62" rx="32" ry="20" fill="white" opacity="0.6" />
                <ellipse cx="75" cy="68" rx="22" ry="16" fill="white" opacity="0.5" />
                <ellipse cx="270" cy="95" rx="35" ry="19" fill="white" opacity="0.45" />
                <ellipse cx="300" cy="88" rx="26" ry="16" fill="white" opacity="0.45" />
                {/* Location pins */}
                <circle cx="155" cy="130" r="12" fill="#10B981" />
                <circle cx="155" cy="130" r="5" fill="white" />
                <line x1="155" y1="142" x2="155" y2="155" stroke="#10B981" strokeWidth="2.5" />
                <circle cx="325" cy="115" r="12" fill="#EF4444" />
                <circle cx="325" cy="115" r="5" fill="white" />
                <line x1="325" y1="127" x2="325" y2="152" stroke="#EF4444" strokeWidth="2.5" />
                {/* Route dotted line */}
                <path d="M155,145 Q240,80 325,125" stroke="white" strokeWidth="2" strokeDasharray="6,4" fill="none" opacity="0.5" />
              </svg>

              {/* Floating UI cards */}
              <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-2xl p-3.5 flex items-center gap-3 border border-slate-100">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
                <div><p className="text-xs font-bold text-slate-900">Booking Confirmed!</p><p className="text-[10px] text-slate-500">Arjun picks up at 8:30 AM</p></div>
              </div>
              <div className="absolute bottom-32 right-4 bg-white rounded-2xl shadow-2xl p-3.5 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 mb-1.5">Your savings this month</p>
                <p className="text-xl font-black text-emerald-600 font-display">₹4,200</p>
                <div className="flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3 text-emerald-500" /><span className="text-[10px] text-emerald-600 font-semibold">vs solo cab rides</span></div>
              </div>
              <div className="absolute top-24 left-0 bg-white rounded-2xl shadow-2xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Avatar initials="AS" size="xs" /><span className="text-[11px] font-bold text-slate-900">Arjun Sharma</span>
                </div>
                <Stars rating={4.8} />
                <p className="text-[10px] text-slate-500 mt-1">234 rides · Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-4xl px-4 z-20">
          <Card className="shadow-2xl border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5">
              <p className="text-white font-bold text-sm flex items-center gap-2"><Search className="w-4 h-4" /> Find your next ride</p>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid sm:grid-cols-4 gap-3">
                <FormInput placeholder="From where?" icon={<MapPin className="w-4 h-4" />} value={from} onChange={setFrom} />
                <FormInput placeholder="Where to?" icon={<MapPin className="w-4 h-4" />} value={to} onChange={setTo} />
                <FormInput type="date" icon={<Calendar className="w-4 h-4" />} />
                <Btn full size="lg" onClick={() => navigate("search")} className="font-black">
                  <Search className="w-4 h-4" /> Search Rides
                </Btn>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <p className="text-xs text-slate-400 font-medium mr-1">Popular:</p>
                {["Delhi → Gurgaon", "Bandra → Andheri", "Koramangala → Whitefield"].map(route => (
                  <button key={route} onClick={() => navigate("search")} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors">{route}</button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES */}
      <section className="pt-48 pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">Why RaahiOne?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display mb-4">Built for the modern Indian commuter</h2>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">Everything you need to make your daily travel smarter, cheaper, and more sustainable — all in one platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Shield className="w-6 h-6" />, color: "blue", title: "Safety First", desc: "Every driver is ID-verified. Live trip sharing, SOS alerts, emergency contacts, and 24/7 support keep you protected at all times.", badge: "Aadhaar Verified" },
              { icon: <DollarSign className="w-6 h-6" />, color: "green", title: "Save Up to 70%", desc: "Split fuel costs with co-passengers. Travel Delhi to Gurgaon for under ₹200 — a fraction of what Ola or Uber would charge.", badge: "₹4,200 avg. monthly savings" },
              { icon: <Cpu className="w-6 h-6" />, color: "purple", title: "AI-Powered Matching", desc: "Our intelligent recommendation engine learns your schedule, preferred routes, and past rides to suggest perfect matches in seconds.", badge: "96% match accuracy" },
              { icon: <Users className="w-6 h-6" />, color: "orange", title: "Trusted Community", desc: "Join 52,000+ students, professionals, and daily commuters. Build a network of reliable co-passengers on your regular routes.", badge: "50K+ active riders" },
              { icon: <Navigation className="w-6 h-6" />, color: "blue", title: "Live Tracking", desc: "Track your ride in real-time. Know exactly where your driver is, share your live location with family, and get instant ETA updates.", badge: "Real-time GPS" },
              { icon: <Leaf className="w-6 h-6" />, color: "green", title: "Eco-Friendly Impact", desc: "Every shared ride reduces CO₂ emissions. Our users have collectively saved 420+ tonnes of carbon this year — and counting.", badge: "420t CO₂ saved" },
            ].map(({ icon, color, title, desc, badge }) => {
              const styles: Record<string, string> = { blue: "bg-blue-50 text-blue-600 border-blue-100", green: "bg-emerald-50 text-emerald-600 border-emerald-100", purple: "bg-purple-50 text-purple-600 border-purple-100", orange: "bg-orange-50 text-orange-600 border-orange-100" };
              const badgeStyles: Record<string, string> = { blue: "bg-blue-100 text-blue-700", green: "bg-emerald-100 text-emerald-700", purple: "bg-purple-100 text-purple-700", orange: "bg-orange-100 text-orange-700" };
              return (
                <div key={title} className="group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className={cn("w-13 h-13 rounded-2xl flex items-center justify-center mb-4 border w-[52px] h-[52px]", styles[color])}>{icon}</div>
                    <h3 className="font-black text-slate-900 mb-2 font-display text-lg">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full", badgeStyles[color])}>{badge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">Simple 4-step process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">How RaahiOne works</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />
            {[
              { step: "01", icon: <User className="w-7 h-7" />, title: "Create Profile", desc: "Sign up in 60 seconds. Verify your phone and ID to unlock the full RaahiOne experience.", color: "from-blue-500 to-blue-600" },
              { step: "02", icon: <Search className="w-7 h-7" />, title: "Search or Offer", desc: "Find rides matching your route and time, or publish your own ride to earn while you commute.", color: "from-indigo-500 to-purple-600" },
              { step: "03", icon: <CheckCircle className="w-7 h-7" />, title: "Book & Connect", desc: "Request a seat instantly. Driver confirms in minutes. Chat in-app to coordinate the pickup.", color: "from-emerald-500 to-teal-600" },
              { step: "04", icon: <Star className="w-7 h-7" />, title: "Ride & Rate", desc: "Enjoy a comfortable shared commute. Rate each other to build community trust and safety.", color: "from-amber-500 to-orange-500" },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step} className="relative group">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300", color)}>
                      {icon}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white border-2 border-slate-200 text-slate-700 text-xs font-black rounded-full w-7 h-7 flex items-center justify-center shadow-sm">{step}</div>
                  </div>
                  <h3 className="font-black text-slate-900 mb-2 font-display text-lg">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">Real People. Real Savings.</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Commuters love RaahiOne</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5 italic font-medium">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Avatar initials={t.initials} size="sm" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-600 font-display">{t.rides} rides</p>
                    <p className="text-[10px] text-slate-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-7">
            <Award className="w-4 h-4 text-amber-300" />
            <span className="text-white/90 text-sm font-medium">#1 Rated Ride-Sharing App in India 2025</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 font-display leading-tight">
            Your smarter commute<br />starts today.
          </h2>
          <p className="text-blue-200 mb-10 text-lg leading-relaxed">Join 52,000+ commuters already saving time, money, and the planet every single day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Btn size="lg" variant="white" onClick={() => navigate("register")} className="font-black text-base">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Btn>
            <Btn size="lg" variant="outline" onClick={() => navigate("offer")} className="!border-white/30 !text-white hover:!bg-white/10 font-semibold text-base">
              <Car className="w-5 h-5" /> Start Offering Rides
            </Btn>
          </div>
          <p className="text-blue-300 text-sm mt-6">Free forever for riders · Earn money as a driver · No subscription fees</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-white font-display">Raahi<span className="text-blue-400">One</span></span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-xs">India&apos;s most trusted ride-sharing platform. Making daily commutes smarter, affordable, and sustainable since 2023.</p>
              <div className="flex gap-3">
                {["App Store", "Play Store"].map(s => (
                  <div key={s} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-slate-700 transition-colors">
                    <p className="text-[10px] text-slate-400 font-medium">Download on</p>
                    <p className="text-white font-bold text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Find a Ride", "Offer a Ride", "How it Works", "Pricing", "Safety"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Blog", "Investors"] },
              { title: "Support", links: ["Help Center", "Contact Us", "Terms of Service", "Privacy Policy", "Cookie Policy"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="font-black text-white mb-4 text-sm tracking-wide">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(l => <li key={l}><a className="text-slate-400 text-sm hover:text-white transition-colors cursor-pointer hover:underline">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2025 RaahiOne Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span>Carbon neutral since 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
function AuthWrap({ children, title, sub, navigate }: { children: React.ReactNode; title: string; sub: string; navigate: Navigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex">
      {/* Left panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10">
          <button onClick={() => navigate("landing")} className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
            <span className="text-2xl font-black text-white font-display">Raahi<span className="text-blue-200">One</span></span>
          </button>
          <h2 className="text-3xl font-black text-white font-display leading-tight mb-4">Smart commuting starts here.</h2>
          <p className="text-blue-200 text-sm leading-relaxed">Join 52,000+ commuters who save ₹4,000+ every month with RaahiOne&apos;s verified, affordable ride-sharing.</p>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            { icon: <Shield className="w-4 h-4" />, text: "100% ID-verified drivers & riders" },
            { icon: <Star className="w-4 h-4" />, text: "4.8★ average platform rating" },
            { icon: <DollarSign className="w-4 h-4" />, text: "Save up to 70% vs solo cab rides" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-blue-100">
              <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0">{icon}</div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <button onClick={() => navigate("landing")} className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 font-display">Raahi<span className="text-blue-600">One</span></span>
          </button>
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 font-display mb-2">{title}</h1>
            <p className="text-slate-500 text-sm">{sub}</p>
          </div>
          <Card className="p-8 shadow-lg">{children}</Card>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ navigate }: { navigate: Navigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
      navigate("dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrap title="Welcome back!" sub="Sign in to continue to your RaahiOne account" navigate={navigate}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <FormInput label="Email address" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} value={email} onChange={setEmail} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-11" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1" onClick={() => setShow(!show)}>
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Btn full size="lg" loading={loading} onClick={handleLogin} className="font-black mt-2">Sign in to RaahiOne</Btn>
        <p className="text-center text-sm text-slate-500 mt-5">
          New to RaahiOne?{" "}
          <button className="text-blue-600 font-bold hover:underline" onClick={() => navigate("register")}>Create free account</button>
        </p>
      </div>
    </AuthWrap>
  );
}

function RegisterPage({ navigate }: { navigate: Navigate }) {
  const { register } = useAuth();
  const [role, setRole] = useState<"commuter" | "driver">("commuter");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        preferred_max_walk_km: 2,
        preferred_time_window_minutes: 60,
      });
      navigate("dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrap title="Create your account" sub="Join commuters on RaahiOne Smart Commute" navigate={navigate}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
          {(["commuter", "driver"] as const).map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} className={cn("py-2.5 rounded-xl text-sm font-bold transition-all capitalize", role === r ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
              {r === "commuter" ? "Commuter" : "Driver"}
            </button>
          ))}
        </div>
        <FormInput label="Full name" placeholder="Your name" value={name} onChange={setName} required />
        <FormInput label="Email address" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} value={email} onChange={setEmail} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-11" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1" onClick={() => setShow(!show)}>
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500">Use Bangalore area names like Indiranagar Metro, Whitefield, or Koramangala when searching or offering rides.</p>
        <Btn full size="lg" loading={loading} onClick={handleRegister} className="font-black"><CheckCircle className="w-4 h-4" /> Create Account</Btn>
        <p className="text-center text-sm text-slate-500">
          Have an account? <button className="text-blue-600 font-bold hover:underline" onClick={() => navigate("login")}>Sign in</button>
        </p>
      </div>
    </AuthWrap>
  );
}

function ForgotPage({ navigate }: { navigate: Navigate }) {
  const [stage, setStage] = useState<"email" | "otp" | "done">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const handleOtp = (val: string, idx: number) => {
    const newOtp = [...otp]; newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
  return (
    <AuthWrap title={stage === "email" ? "Forgot password?" : stage === "otp" ? "Enter OTP" : "Password reset!"} sub={stage === "email" ? "We'll send a 6-digit OTP to your email" : stage === "otp" ? "Check your email for the 6-digit code" : "Your password has been successfully reset"} navigate={navigate}>
      {stage === "email" && (
        <div className="space-y-4">
          <FormInput label="Email address" type="email" placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} required />
          <Btn full size="lg" onClick={() => setStage("otp")} className="font-black">Send OTP Code</Btn>
          <button className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-2" onClick={() => navigate("login")}>
            <ChevronLeft className="w-4 h-4" /> Back to sign in
          </button>
        </div>
      )}
      {stage === "otp" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500">Code sent to <strong>ar***@example.com</strong></p>
          <div className="flex gap-2 justify-between">
            {otp.map((v, i) => (
              <input key={i} ref={el => { inputRefs.current[i] = el; }} type="text" maxLength={1} value={v} onChange={e => handleOtp(e.target.value, i)}
                className="w-12 h-14 text-center text-xl font-black border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            ))}
          </div>
          <Btn full size="lg" onClick={() => setStage("done")} className="font-black">Verify OTP</Btn>
          <button className="w-full text-sm text-blue-600 font-semibold text-center hover:underline">Resend OTP (60s)</button>
        </div>
      )}
      {stage === "done" && (
        <div className="text-center py-2">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">Your password has been reset successfully. You can now sign in with your new password.</p>
          <Btn full size="lg" onClick={() => navigate("login")} className="font-black">Sign in now</Btn>
        </div>
      )}
    </AuthWrap>
  );
}

// ─── APP LAYOUT ───────────────────────────────────────────────────────────────
const NAV = [
  { screen: "dashboard" as Screen, icon: <Home className="w-5 h-5" />, label: "Dashboard" },
  { screen: "search" as Screen, icon: <Search className="w-5 h-5" />, label: "Find Rides" },
  { screen: "offer" as Screen, icon: <Plus className="w-5 h-5" />, label: "Offer Ride" },
  { screen: "bookings" as Screen, icon: <BookOpen className="w-5 h-5" />, label: "My Bookings" },
  { screen: "recommendations" as Screen, icon: <Zap className="w-5 h-5" />, label: "Smart Picks" },
  { screen: "driver" as Screen, icon: <Car className="w-5 h-5" />, label: "Driver Mode" },
  { screen: "profile" as Screen, icon: <User className="w-5 h-5" />, label: "My Profile" },
  { screen: "admin" as Screen, icon: <LayoutDashboard className="w-5 h-5" />, label: "Admin" },
];

function AppLayout({ current, navigate, children, onLogout }: { current: Screen; navigate: Navigate; children: React.ReactNode; onLogout: () => void }) {
  const { user } = useAuth();
  const [sideOpen, setSideOpen] = useState(false);
  const userInitials = user ? initials(user.name) : "??";
  const navItems = NAV.filter(item => item.screen !== "admin" || user?.is_admin);
  const navItemsFiltered = navItems.filter(item => item.screen !== "offer" || user?.role === "driver" || user?.is_admin);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc" }}>
      <style>{`
        .font-display { font-family: 'Outfit', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 font-display">Raahi<span className="text-blue-600">One</span></span>
          </div>
        </div>
        <nav className="flex-1 py-5 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-5 mb-3">Navigation</p>
          <ul className="space-y-0.5 px-3">
            {navItemsFiltered.map(({ screen, icon, label }) => (
              <li key={screen}>
                <button onClick={() => navigate(screen)}
                  className={cn("w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                    current === screen ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
                  <span className={cn("transition-transform group-hover:scale-110", current === screen ? "text-white" : "text-slate-400")}>{icon}</span>
                  {label}
                  {screen === "recommendations" && <span className="ml-auto bg-amber-400 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">NEW</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-1">
          <div onClick={() => navigate("profile")} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
            <Avatar initials={userInitials} size="sm" online />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name ?? "Guest"}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user?.role ?? ""}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSideOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="text-xl font-black text-slate-900 font-display">Raahi<span className="text-blue-600">One</span></span>
              <button onClick={() => setSideOpen(false)} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
              <ul className="space-y-0.5 px-3">
                {navItemsFiltered.map(({ screen, icon, label }) => (
                  <li key={screen}>
                    <button onClick={() => { navigate(screen); setSideOpen(false); }}
                      className={cn("w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all",
                        current === screen ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>
                      {icon}{label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100" onClick={() => setSideOpen(true)}><Menu className="w-5 h-5 text-slate-600" /></button>
              <div className="lg:hidden">
                <span className="font-black text-slate-900 font-display">Raahi<span className="text-blue-600">One</span></span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-900 capitalize">{navItemsFiltered.find(n => n.screen === current)?.label ?? "RaahiOne"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div onClick={() => navigate("profile")} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
                <Avatar initials={userInitials} size="xs" online />
                <span className="hidden sm:block text-sm font-semibold text-slate-700">{user?.name.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 scrollbar-hide">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex z-40">
          {navItemsFiltered.slice(0, 5).map(({ screen, icon, label }) => (
            <button key={screen} onClick={() => navigate(screen)}
              className={cn("flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors relative",
                current === screen ? "text-blue-600" : "text-slate-400")}>
              {current === screen && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />}
              <span className={cn("p-1.5 rounded-xl transition-all", current === screen && "bg-blue-50 scale-110")}>{icon}</span>
              <span className="leading-none">{label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function UserDashboard({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const [rides, setRides] = useState<ApiRide[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    api.listRides({ limit: 6 }).then(setRides).catch(() => setRides([]));
    api.myBookings().then(setBookings).catch(() => setBookings([]));
  }, []);

  const upcoming = bookings.filter(b => ["REQUESTED", "ACCEPTED"].includes(b.status)).slice(0, 3);
  const userInitials = user ? initials(user.name) : "??";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar initials={userInitials} size="md" online />
              <div>
                <p className="text-blue-200 text-sm font-medium">{greeting},</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">{user?.name ?? "Commuter"}</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn size="sm" variant="white" onClick={() => navigate("search")} className="font-bold"><Search className="w-4 h-4" /> Find a ride</Btn>
              {(user?.role === "driver" || user?.is_admin) && (
                <Btn size="sm" variant="outline" onClick={() => navigate("offer")} className="!border-white/30 !text-white hover:!bg-white/10 font-bold"><Plus className="w-4 h-4" /> Offer ride</Btn>
              )}
              <Btn size="sm" variant="outline" onClick={() => navigate("recommendations")} className="!border-white/30 !text-white hover:!bg-white/10 font-bold"><Zap className="w-4 h-4" /> Smart picks</Btn>
            </div>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 shrink-0 min-w-[160px]">
            <p className="text-blue-200 text-xs font-semibold mb-1">Your bookings</p>
            <p className="text-3xl font-black text-white font-display">{bookings.length}</p>
            <p className="text-blue-200 text-xs mt-1">{upcoming.length} upcoming</p>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Available rides" action={() => navigate("search")} actionLabel="View all" />
        <div className="grid sm:grid-cols-2 gap-4">
          {rides.slice(0, 4).map(ride => (
            <ApiRideCard key={ride.id} ride={ride} onView={() => navigate("ride-detail", ride.id)} onBook={() => navigate("ride-detail", ride.id)} />
          ))}
          {rides.length === 0 && <Card className="p-6 text-sm text-slate-500">No active rides yet. Be the first driver to publish one.</Card>}
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <SectionHeader title="Upcoming bookings" action={() => navigate("bookings")} actionLabel="All bookings" />
          <div className="space-y-3">
            {upcoming.map(b => (
              <Card key={b.id} hover className="p-4">
                <p className="font-bold text-sm">Booking #{b.id} · {b.status}</p>
                <Btn size="xs" className="mt-2" onClick={() => navigate("ride-detail", b.ride_id)}>View ride</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
function SearchRides({ navigate }: { navigate: Navigate }) {
  const [from, setFrom] = useState("Indiranagar Metro");
  const [to, setTo] = useState("Whitefield");
  const [rides, setRides] = useState<ApiRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const runSearch = async () => {
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.listRides({
        source: from.trim() || undefined,
        destination: to.trim() || undefined,
        limit: 50,
      });
      setRides(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load rides");
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-2xl font-black text-slate-900 font-display">Find a Ride</h1>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-white" />
          <p className="text-white font-bold text-sm">Search your route</p>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <FormInput label="From" placeholder="e.g. Indiranagar Metro" icon={<MapPin className="w-4 h-4" />} value={from} onChange={setFrom} />
            <FormInput label="To" placeholder="e.g. Whitefield" icon={<MapPin className="w-4 h-4" />} value={to} onChange={setTo} />
          </div>
          <p className="text-xs text-slate-500">Supported areas: {SAMPLE_LOCATIONS.join(", ")}</p>
          <Btn loading={loading} onClick={runSearch} className="font-bold"><Search className="w-4 h-4" /> Search rides</Btn>
        </div>
      </Card>

      <div>
        <p className="text-sm font-bold text-slate-500 mb-3">{rides.length} active rides found</p>
        <div className="flex flex-col gap-4">
          {rides.map(ride => (
            <ApiRideCard
              key={ride.id}
              ride={ride}
              onView={() => navigate("ride-detail", ride.id)}
              onBook={() => navigate("ride-detail", ride.id)}
            />
          ))}
          {searched && !loading && rides.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 mb-1">No rides match your search</p>
              <p className="text-slate-500 text-sm">Try different locations or ask a driver to publish a ride</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RIDE DETAIL ──────────────────────────────────────────────────────────────
function RideDetail({ navigate, rideId }: { navigate: Navigate; rideId: number }) {
  const [ride, setRide] = useState<ApiRide | null>(null);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    setFetching(true);
    api.getRide(rideId)
      .then(setRide)
      .catch(err => setError(err instanceof ApiError ? err.message : "Failed to load ride"))
      .finally(() => setFetching(false));
  }, [rideId]);

  const handleBook = async () => {
    setError("");
    setLoading(true);
    try {
      const booking = await api.bookRide(rideId);
      setBookingId(booking.id);
      setBooked(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="max-w-2xl mx-auto py-20 text-center text-slate-500">Loading ride...</div>;
  }

  if (!ride) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => navigate("search")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <Card className="p-8 text-center text-red-600">{error || "Ride not found"}</Card>
      </div>
    );
  }

  const { date, time } = formatDateTime(ride.departure_time);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate("search")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to results
      </button>

      {!booked ? (
        <>
          <ApiRideCard ride={ride} />
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div><p className="text-slate-400 text-xs">Date</p><p className="font-bold">{date}</p></div>
              <div><p className="text-slate-400 text-xs">Departure</p><p className="font-bold">{time}</p></div>
              <div><p className="text-slate-400 text-xs">Driver</p><p className="font-bold">#{ride.driver_id}</p></div>
              <div><p className="text-slate-400 text-xs">Seats left</p><p className="font-bold">{ride.available_seats}</p></div>
            </div>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <Btn full size="lg" loading={loading} onClick={handleBook} className="font-black" disabled={ride.available_seats <= 0}>
              <CheckCircle className="w-5 h-5" /> Request seat
            </Btn>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 font-display mb-2">Booking requested!</h2>
          <p className="text-slate-500 text-sm mb-6">Your seat request for {ride.source} → {ride.destination} on {date} at {time} was submitted.</p>
          {bookingId && <p className="text-sm font-bold text-slate-700 mb-4">Booking #{bookingId}</p>}
          <div className="flex gap-3">
            <Btn full variant="outline" onClick={() => navigate("bookings")}><BookOpen className="w-4 h-4" /> My Bookings</Btn>
            <Btn full onClick={() => navigate("dashboard")}><Home className="w-4 h-4" /> Dashboard</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── OFFER RIDE ───────────────────────────────────────────────────────────────
function OfferRide({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("Indiranagar Metro");
  const [to, setTo] = useState("Whitefield");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [seats, setSeats] = useState("3");
  const [error, setError] = useState("");
  const [createdRideId, setCreatedRideId] = useState<number | null>(null);

  if (user && user.role !== "driver" && !user.is_admin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Only driver accounts can publish rides. Register as a driver or switch accounts.</p>
          <Btn onClick={() => navigate("search")}>Browse rides</Btn>
        </Card>
      </div>
    );
  }

  const handlePublish = async () => {
    setError("");
    setLoading(true);
    try {
      const ride = await api.createRide({
        source: from,
        destination: to,
        departure_time: toApiDateTime(date, time),
        available_seats: Number(seats),
      });
      setCreatedRideId(ride.id);
      setPublished(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Offer a Ride</h1>
        <p className="text-slate-500 text-sm mt-1">Publish a ride for commuters on your route</p>
      </div>

      {!published ? (
        <Card className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput label="From" placeholder="Indiranagar Metro" icon={<MapPin className="w-4 h-4" />} value={from} onChange={setFrom} required />
            <FormInput label="To" placeholder="Whitefield" icon={<MapPin className="w-4 h-4" />} value={to} onChange={setTo} required />
            <FormInput label="Departure Date" type="date" icon={<Calendar className="w-4 h-4" />} value={date} onChange={setDate} required />
            <FormInput label="Departure Time" type="time" icon={<Clock className="w-4 h-4" />} value={time} onChange={setTime} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Available seats</label>
            <select value={seats} onChange={e => setSeats(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 text-slate-900">
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} seat{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
          <p className="text-xs text-slate-500">Use supported Bangalore area names. Coordinates are resolved automatically.</p>
          <Btn full size="lg" loading={loading} onClick={handlePublish} className="font-black">
            <Plus className="w-5 h-5" /> Publish ride
          </Btn>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 font-display mb-2">Ride published!</h2>
          <p className="text-slate-500 text-sm mb-4">Ride #{createdRideId} is now active with {seats} seats.</p>
          <div className="flex gap-3">
            <Btn full variant="outline" onClick={() => navigate("driver")}><Car className="w-4 h-4" /> Driver dashboard</Btn>
            <Btn full onClick={() => { setPublished(false); setFrom(""); setTo(""); }}><Plus className="w-4 h-4" /> Offer another</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── MY BOOKINGS ──────────────────────────────────────────────────────────────
function MyBookings({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [ridesById, setRidesById] = useState<Record<number, ApiRide>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingRideId, setRatingRideId] = useState<number | null>(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.myBookings();
      setBookings(data);
      const rideEntries = await Promise.all(
        data.map(async (b) => {
          try {
            const ride = await api.getRide(b.ride_id);
            return [b.ride_id, ride] as const;
          } catch {
            return null;
          }
        }),
      );
      const map: Record<number, ApiRide> = {};
      rideEntries.forEach(entry => { if (entry) map[entry[0]] = entry[1]; });
      setRidesById(map);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const filtered = bookings.filter(b => {
    if (tab === "upcoming") return ["REQUESTED", "ACCEPTED"].includes(b.status);
    if (tab === "completed") return b.status === "COMPLETED";
    return b.status === "CANCELLED";
  });

  const handleCancel = async (bookingId: number) => {
    try {
      await api.cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cancel failed");
    }
  };

  const submitRating = async () => {
    if (!ratingRideId || ratingScore < 1) return;
    try {
      await api.rateRide(ratingRideId, ratingScore, ratingComment || undefined);
      setRatingRideId(null);
      setRatingScore(0);
      setRatingComment("");
      await loadBookings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Rating failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {ratingRideId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="p-6 w-full max-w-sm space-y-4">
            <h3 className="font-black text-lg">Rate ride #{ratingRideId}</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} type="button" onClick={() => setRatingScore(i)}>
                  <Star className={cn("w-8 h-8", i <= ratingScore ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                </button>
              ))}
            </div>
            <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Optional comment" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={3} />
            <div className="flex gap-2">
              <Btn variant="ghost" full onClick={() => setRatingRideId(null)}>Cancel</Btn>
              <Btn full disabled={ratingScore < 1} onClick={submitRating}>Submit</Btn>
            </div>
          </Card>
        </div>
      )}
      <h1 className="text-2xl font-black text-slate-900 font-display">My Bookings</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(["upcoming", "completed", "cancelled"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize", tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {t}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-center text-slate-500 py-16">Loading bookings...</p>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 mb-1">No {tab} bookings</p>
              <Btn onClick={() => navigate("search")}><Search className="w-4 h-4" /> Browse rides</Btn>
            </div>
          )}
          {filtered.map(b => {
            const ride = ridesById[b.ride_id];
            const status = bookingStatusLabel(b.status);
            const when = ride ? formatDateTime(ride.departure_time) : null;
            return (
              <Card key={b.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-black text-slate-900 text-sm">Booking #{b.id}</p>
                    <Pill variant={status.variant} dot>{status.label}</Pill>
                  </div>
                  {when && <p className="text-xs text-slate-500">{when.date} · {when.time}</p>}
                </div>
                {ride ? (
                  <p className="text-sm font-semibold text-slate-800 mb-4">{ride.source} → {ride.destination}</p>
                ) : (
                  <p className="text-sm text-slate-500 mb-4">Ride #{b.ride_id}</p>
                )}
                <div className="flex gap-2">
                  {["REQUESTED", "ACCEPTED"].includes(b.status) && (
                    <Btn size="xs" variant="danger" onClick={() => handleCancel(b.id)}><XCircle className="w-3.5 h-3.5" /> Cancel</Btn>
                  )}
                  {["ACCEPTED", "COMPLETED"].includes(b.status) && (
                    <Btn size="xs" variant="outline" onClick={() => setRatingRideId(b.ride_id)}><Star className="w-3.5 h-3.5" /> Rate</Btn>
                  )}
                  <Btn size="xs" variant="ghost" onClick={() => navigate("ride-detail", b.ride_id)}><Eye className="w-3.5 h-3.5" /> Details</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── USER PROFILE (read-only from API) ───────────────────────────────────────
function UserProfile({ navigate }: { navigate: Navigate }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-black text-slate-900 font-display">My Profile</h1>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar initials={initials(user.name)} size="lg" />
          <div>
            <p className="text-xl font-black text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <Pill variant="blue" dot>{user.role}</Pill>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div><p className="text-xs text-slate-400">Max walk distance</p><p className="font-bold">{user.preferred_max_walk_km} km</p></div>
          <div><p className="text-xs text-slate-400">Time window</p><p className="font-bold">{user.preferred_time_window_minutes} min</p></div>
        </div>
        <Btn variant="danger" onClick={() => { logout(); navigate("landing"); }}><LogOut className="w-4 h-4" /> Sign out</Btn>
      </Card>
    </div>
  );
}


// ─── DRIVER DASHBOARD ─────────────────────────────────────────────────────────
function DriverDashboard({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const [rides, setRides] = useState<ApiRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listRides({ limit: 50 })
      .then(all => setRides(all.filter(r => r.driver_id === user?.id)))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Driver Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your published rides and seat availability</p>
      </div>
      <Card className="p-4 bg-amber-50 border-amber-200 text-amber-800 text-sm">
        Accept/reject booking requests is not implemented in the backend prototype. Passengers create bookings with status REQUESTED.
      </Card>
      {loading ? (
        <p className="text-slate-500 text-center py-12">Loading your rides...</p>
      ) : rides.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-600 mb-4">You have no active published rides yet.</p>
          <Btn onClick={() => navigate("offer")}><Plus className="w-4 h-4" /> Offer a ride</Btn>
        </Card>
      ) : (
        <div className="space-y-4">
          {rides.map(ride => (
            <ApiRideCard key={ride.id} ride={ride} onView={() => navigate("ride-detail", ride.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RECOMMENDATIONS ──────────────────────────────────────────────────────────
function Recommendations({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const [from, setFrom] = useState("Indiranagar Metro");
  const [to, setTo] = useState("Whitefield");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [recs, setRecs] = useState<RideRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runRecommendations = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.recommendations({
        source: from,
        destination: to,
        departure_time: toApiDateTime(date, time),
        max_walk_km: user?.preferred_max_walk_km,
        time_window_minutes: user?.preferred_time_window_minutes,
      });
      setRecs(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to get recommendations");
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md shrink-0">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Smart Picks</h1>
          <p className="text-slate-500 text-sm mt-1">Explainable ride recommendations from your backend engine</p>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <FormInput label="From" value={from} onChange={setFrom} icon={<MapPin className="w-4 h-4" />} />
          <FormInput label="To" value={to} onChange={setTo} icon={<MapPin className="w-4 h-4" />} />
          <FormInput label="Date" type="date" value={date} onChange={setDate} icon={<Calendar className="w-4 h-4" />} />
          <FormInput label="Time" type="time" value={time} onChange={setTime} icon={<Clock className="w-4 h-4" />} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Btn loading={loading} onClick={runRecommendations} className="font-bold"><Zap className="w-4 h-4" /> Get recommendations</Btn>
      </Card>

      <div className="space-y-4">
        {recs.map(rec => (
          <ApiRideCard
            key={rec.ride_id}
            ride={{
              id: rec.ride_id,
              driver_id: rec.driver_id,
              source: rec.source,
              destination: rec.destination,
              departure_time: rec.departure_time,
              available_seats: rec.available_seats,
              status: "ACTIVE",
              source_lat: 0,
              source_lng: 0,
              destination_lat: 0,
              destination_lng: 0,
            }}
            score={rec.score.total}
            reason={rec.score.reason}
            onBook={() => navigate("ride-detail", rec.ride_id)}
            onView={() => navigate("ride-detail", rec.ride_id)}
          />
        ))}
        {!loading && recs.length === 0 && (
          <Card className="p-8 text-center text-slate-500 text-sm">Run a search to see ranked rides with match scores and reasons.</Card>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ users: number; active_rides: number; bookings: number; open_requests: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.is_admin) return;
    api.adminAnalytics()
      .then(setStats)
      .catch(err => setError(err instanceof ApiError ? err.message : "Failed to load analytics"));
  }, [user?.is_admin]);

  if (!user?.is_admin) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <p className="text-slate-600">Admin access required.</p>
        <Btn className="mt-4" onClick={() => navigate("dashboard")}>Back to dashboard</Btn>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-blue-600" />
          <p className="text-xs font-black text-blue-600 uppercase tracking-[0.15em]">Admin Portal</p>
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Platform analytics</h1>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total users" value={String(stats.users)} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard label="Active rides" value={String(stats.active_rides)} icon={<Car className="w-5 h-5" />} color="green" />
          <StatCard label="Bookings" value={String(stats.bookings)} icon={<BookOpen className="w-5 h-5" />} color="purple" />
          <StatCard label="Open requests" value={String(stats.open_requests)} icon={<Clock className="w-5 h-5" />} color="orange" />
        </div>
      )}
      <Card className="p-5 text-sm text-slate-600">
        User and ride management tables were removed because the backend exposes analytics via GET /admin/analytics only.
      </Card>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedRideId, setSelectedRideId] = useState(1);

  const navigate: Navigate = (s, extra) => {
    if (s === "ride-detail" && typeof extra === "number") setSelectedRideId(extra);
    setScreen(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    navigate("landing");
  };

  const PUBLIC: Screen[] = ["landing", "login", "register"];

  useEffect(() => {
    if (!loading && user && PUBLIC.includes(screen)) {
      setScreen("dashboard");
    }
    if (!loading && !user && !PUBLIC.includes(screen)) {
      setScreen("login");
    }
  }, [loading, user, screen]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .font-display { font-family: 'Outfit', sans-serif !important; }
        body { font-family: 'Inter', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {PUBLIC.includes(screen) ? (
        <>
          {screen === "landing" && <LandingPage navigate={navigate} />}
          {screen === "login" && <LoginPage navigate={navigate} />}
          {screen === "register" && <RegisterPage navigate={navigate} />}
        </>
      ) : (
        <AppLayout current={screen} navigate={navigate} onLogout={handleLogout}>
          {screen === "dashboard" && <UserDashboard navigate={navigate} />}
          {screen === "search" && <SearchRides navigate={navigate} />}
          {screen === "ride-detail" && <RideDetail navigate={navigate} rideId={selectedRideId} />}
          {screen === "offer" && <OfferRide navigate={navigate} />}
          {screen === "bookings" && <MyBookings navigate={navigate} />}
          {screen === "profile" && <UserProfile navigate={navigate} />}
          {screen === "driver" && <DriverDashboard navigate={navigate} />}
          {screen === "recommendations" && <Recommendations navigate={navigate} />}
          {screen === "admin" && <AdminDashboard navigate={navigate} />}
        </AppLayout>
      )}
    </>
  );
}

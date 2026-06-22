import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import type { Ride } from "../../lib/types";
import { formatDateTime } from "../../lib/format";

function cn(...c: (string | false | undefined | null)[]): string {
  return c.filter(Boolean).join(" ");
}

function Card({
  children,
  className = "",
  hover = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-sm",
        hover && "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Btn({
  children,
  size = "md",
  full = false,
  className = "",
  onClick,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
  full?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const sz = { sm: "px-4 py-2 text-sm", md: "px-5 py-2.5 text-sm" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all",
        sz[size],
        full && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ApiRideCard({
  ride,
  score,
  reason,
  onBook,
  onView,
}: {
  ride: Ride;
  score?: number;
  reason?: string;
  onBook?: () => void;
  onView?: () => void;
}) {
  const { date, time } = formatDateTime(ride.departure_time);

  return (
    <Card hover onClick={onView} className="overflow-hidden">
      {score != null && (
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${Math.min(score, 100)}%` }} />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-slate-900 text-sm">Driver #{ride.driver_id}</p>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{ride.status.toLowerCase()}</p>
          </div>
          {score != null && (
            <span className="text-xs font-black text-purple-700 bg-purple-50 border border-purple-100 px-2 py-1 rounded-full">
              {Math.round(score)} pts
            </span>
          )}
        </div>

        <div className="relative pl-4 space-y-2 mb-3">
          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-full" />
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="text-slate-700 font-medium">{ride.source}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="text-slate-700 font-medium">{ride.destination}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Users className="w-3 h-3" />
            {ride.available_seats} seats left
          </span>
        </div>

        {reason && (
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">{reason}</p>
        )}

        {onBook && (
          <Btn
            full
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
          >
            Book Seat <ArrowRight className="w-3.5 h-3.5" />
          </Btn>
        )}
      </div>
    </Card>
  );
}

export function bookingStatusLabel(status: string): { variant: "success" | "warning" | "info" | "danger"; label: string } {
  switch (status) {
    case "REQUESTED":
      return { variant: "warning", label: "Requested" };
    case "ACCEPTED":
      return { variant: "success", label: "Accepted" };
    case "COMPLETED":
      return { variant: "info", label: "Completed" };
    case "CANCELLED":
      return { variant: "danger", label: "Cancelled" };
    default:
      return { variant: "info", label: status };
  }
}

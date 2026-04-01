import { AlertTriangle, Flame, ShieldAlert, Trash2 } from "lucide-react";
import type { Priority } from "../types";
import { getPriorityKey } from "../types";

interface Props {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<
  string,
  {
    label: string;
    className: string;
    Icon: React.ElementType;
    iconColor: string;
  }
> = {
  low: {
    label: "LOW",
    className: "bg-green-100 text-green-700",
    Icon: Trash2,
    iconColor: "text-green-600",
  },
  medium: {
    label: "MEDIUM",
    className: "bg-blue-100 text-blue-700",
    Icon: AlertTriangle,
    iconColor: "text-blue-600",
  },
  high: {
    label: "HIGH",
    className: "bg-orange-100 text-orange-700",
    Icon: Flame,
    iconColor: "text-orange-600",
  },
  urgent: {
    label: "URGENT",
    className: "bg-red-100 text-red-700",
    Icon: ShieldAlert,
    iconColor: "text-red-600",
  },
};

export function PriorityBadge({ priority, className = "" }: Props) {
  const key = getPriorityKey(priority);
  const config = priorityConfig[key] ?? priorityConfig.low;
  const { Icon } = config;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${config.className} ${className}`}
    >
      <Icon size={10} className={config.iconColor} />
      {config.label}
    </span>
  );
}

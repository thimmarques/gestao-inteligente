import { Gavel, Users, Clock, Calendar } from "lucide-react";

export function getEventColor(type: string, status?: string): string {
  // Se cancelado: sempre cinza
  if (status === "cancelado") {
    return "#6b7280"; // gray-500
  }

  // Se concluído: versão mais clara (usando opacidade via hex ou HSL se necessário)
  const opacity = status === "concluído" ? "80" : "ff";

  const colors: Record<string, string> = {
    audiência: "#ef4444" + opacity, // red-500
    reunião: "#3b82f6" + opacity, // blue-500
    prazo: "#eab308" + opacity, // yellow-500
    compromisso: "#8b5cf6" + opacity, // purple-500
  };

  return colors[type] || "#6b7280";
}

export function getEventIcon(type: string) {
  const icons: Record<string, any> = {
    audiência: Gavel,
    reunião: Users,
    prazo: Clock,
    compromisso: Calendar,
  };
  return icons[type] || Calendar;
}

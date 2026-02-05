import { supabase } from "../lib/supabase";

export interface Notification {
  id: string;
  office_id: string;
  lawyer_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  link?: string;
  created_at: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  markAsRead: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) throw error;
  },

  deleteNotification: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  subscribeToNotifications: (
    lawyerId: string,
    callback: (notification: Notification) => void,
  ) => {
    return supabase
      .channel(`public:notifications:lawyer_id=eq.${lawyerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `lawyer_id=eq.${lawyerId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        },
      )
      .subscribe();
  },
};

import { Client } from "../types";
import { supabase } from "../lib/supabase";
import { logAction } from "../utils/auditLogger.ts";

export const clientService = {
  getClients: async (options?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<Client[]> => {
    let query = supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true });

    if (options?.type && options.type !== "todos") {
      query = query.eq("type", options.type);
    }

    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,cpf_cnpj.ilike.%${options.search}%,email.ilike.%${options.search}%`,
      );
    }

    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  getClient: async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  createClient: async (
    data: Omit<Client, "id" | "created_at" | "updated_at" | "process_count">,
  ): Promise<Client> => {
    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({
        ...data,
        process_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: "create",
      entity_type: "client",
      entity_id: newClient.id,
      entity_description: `Novo cliente cadastrado: ${newClient.name}`,
      details: { data: newClient },
      criticality: "normal",
    });

    return newClient;
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    const { data: updatedClient, error } = await supabase
      .from("clients")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: "update",
      entity_type: "client",
      entity_id: id,
      entity_description: `Dados do cliente atualizados: ${updatedClient.name}`,
      details: { after: updatedClient },
      criticality: "normal",
    });

    return updatedClient;
  },

  deleteClient: async (id: string): Promise<void> => {
    // Get client name before delete for logging
    const { data: client } = await supabase
      .from("clients")
      .select("name")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) throw error;

    await logAction({
      action: "delete",
      entity_type: "client",
      entity_id: id,
      entity_description: `Cliente removido: ${client?.name || "ID " + id}`,
      criticality: "crítico",
    });
  },
};

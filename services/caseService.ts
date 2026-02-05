import { Case, CaseWithRelations } from "../types";
import { supabase } from "../lib/supabase";
import { logAction } from "../utils/auditLogger.ts";

export const caseService = {
  getCases: async (options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<CaseWithRelations[]> => {
    let query = supabase
      .from("cases")
      .select(
        `
        *,
        client:clients(*),
        lawyer:profiles(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "todos") {
      query = query.eq("status", options.status);
    }

    if (options?.search) {
      // Search is trickier with relations, but we can search on case fields
      query = query.or(
        `title.ilike.%${options.search}%,process_number.ilike.%${options.search}%`,
      );
    }

    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((c) => ({
      ...c,
      deadlines_count: 0,
      urgent_deadlines_count: 0,
      schedules_count: 0,
      finances_balance: 0,
    })) as CaseWithRelations[];
  },

  getCaseById: async (id: string): Promise<CaseWithRelations | null> => {
    const { data, error } = await supabase
      .from("cases")
      .select(
        `
        *,
        client:clients(*),
        lawyer:profiles(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      deadlines_count: 0,
      urgent_deadlines_count: 0,
      schedules_count: 0,
      finances_balance: 0,
    } as CaseWithRelations;
  },

  createCase: async (
    data: Omit<Case, "id" | "created_at" | "updated_at">,
  ): Promise<Case> => {
    const { data: newCase, error } = await supabase
      .from("cases")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: "create",
      entity_type: "case",
      entity_id: newCase.id,
      entity_description: `Novo processo cadastrado: ${newCase.process_number}`,
      details: { data: newCase },
      criticality: "normal",
    });

    return newCase;
  },

  updateCase: async (id: string, data: Partial<Case>): Promise<Case> => {
    const { data: updatedCase, error } = await supabase
      .from("cases")
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
      entity_type: "case",
      entity_id: id,
      entity_description: `Processo atualizado: ${updatedCase.process_number}`,
      details: { after: updatedCase },
      criticality: "importante",
    });

    return updatedCase;
  },

  deleteCase: async (id: string): Promise<void> => {
    const { data: case_data } = await supabase
      .from("cases")
      .select("process_number")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("cases").delete().eq("id", id);

    if (error) throw error;

    await logAction({
      action: "delete",
      entity_type: "case",
      entity_id: id,
      entity_description: `Processo removido: ${case_data?.process_number || "ID " + id}`,
      criticality: "crítico",
    });
  },
};

import { Deadline } from "../types.ts";
import { supabase } from "../lib/supabase";
import { logAction } from "../utils/auditLogger.ts";

export const deadlineService = {
  getDeadlines: async (): Promise<Deadline[]> => {
    const { data, error } = await supabase
      .from("deadlines")
      .select(
        `
        *,
        case:cases(
          process_number,
          client:clients(name)
        )
      `,
      )
      .order("deadline_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getDeadline: async (id: string): Promise<Deadline | null> => {
    const { data, error } = await supabase
      .from("deadlines")
      .select(
        `
        *,
        case:cases(
          process_number,
          client:clients(name)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  createDeadline: async (
    data: Omit<Deadline, "id" | "created_at" | "case">,
  ): Promise<Deadline> => {
    const { data: newDeadline, error } = await supabase
      .from("deadlines")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: "create",
      entity_type: "deadline",
      entity_id: newDeadline.id,
      entity_description: `Novo prazo processual: ${newDeadline.title}`,
      details: { deadline_date: newDeadline.deadline_date },
      criticality: "normal",
    });

    return newDeadline;
  },

  updateDeadline: async (
    id: string,
    data: Partial<Deadline>,
  ): Promise<Deadline> => {
    const { case: _, ...pureData } = data as any;

    const { data: updatedDeadline, error } = await supabase
      .from("deadlines")
      .update(pureData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: "update",
      entity_type: "deadline",
      entity_id: id,
      entity_description: `Prazo atualizado: ${updatedDeadline.title}`,
      details: { after: updatedDeadline },
      criticality: "normal",
    });

    return updatedDeadline;
  },

  deleteDeadline: async (id: string): Promise<void> => {
    const { data: deadline } = await supabase
      .from("deadlines")
      .select("title")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("deadlines").delete().eq("id", id);

    if (error) throw error;

    await logAction({
      action: "delete",
      entity_type: "deadline",
      entity_id: id,
      entity_description: `Prazo removido: ${deadline?.title || "ID " + id}`,
      criticality: "importante",
    });
  },

  getDeadlinesByCase: async (caseId: string): Promise<Deadline[]> => {
    const { data, error } = await supabase
      .from("deadlines")
      .select("*")
      .eq("case_id", caseId)
      .order("deadline_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

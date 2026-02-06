import { FinanceRecord } from '../types.ts';
import { supabase } from '../lib/supabase';
import { logAction } from '../utils/auditLogger.ts';

export const financeService = {
  getFinances: async (): Promise<FinanceRecord[]> => {
    const { data, error } = await supabase
      .from('finance_records')
      .select(
        `
        *,
        client:clients(name),
        case:cases(process_number)
      `
      )
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getRevenues: async (): Promise<FinanceRecord[]> => {
    const { data, error } = await supabase
      .from('finance_records')
      .select(
        `
        *,
        client:clients(name),
        case:cases(process_number)
      `
      )
      .eq('type', 'receita')
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getExpenses: async (): Promise<FinanceRecord[]> => {
    const { data, error } = await supabase
      .from('finance_records')
      .select(
        `
        *,
        client:clients(name),
        case:cases(process_number)
      `
      )
      .eq('type', 'despesa')
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createRecord: async (
    data: Omit<FinanceRecord, 'id' | 'created_at'>
  ): Promise<FinanceRecord> => {
    const { client: _, case: __, ...pureData } = data as any;

    const { data: newRecord, error } = await supabase
      .from('finance_records')
      .insert(pureData)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: 'create',
      entity_type: 'finance',
      entity_id: newRecord.id,
      entity_description: `Novo lançamento financeiro: ${newRecord.title} (${newRecord.type})`,
      details: { amount: newRecord.amount, type: newRecord.type },
      criticality: 'normal',
    });

    return newRecord;
  },

  updateRecord: async (
    id: string,
    data: Partial<FinanceRecord>
  ): Promise<FinanceRecord> => {
    const { client, case: _, ...pureData } = data as any;

    const { data: updatedRecord, error } = await supabase
      .from('finance_records')
      .update(pureData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: 'update',
      entity_type: 'finance',
      entity_id: id,
      entity_description: `Registro financeiro atualizado: ${updatedRecord.title}`,
      details: { after: updatedRecord },
      criticality: 'importante',
    });

    return updatedRecord;
  },

  deleteRecord: async (id: string): Promise<void> => {
    const { data: record } = await supabase
      .from('finance_records')
      .select('title, amount')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('finance_records')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logAction({
      action: 'delete',
      entity_type: 'finance',
      entity_id: id,
      entity_description: `Lançamento financeiro removido: ${record?.title || 'ID ' + id}`,
      details: { amount: record?.amount },
      criticality: 'crítico',
    });
  },

  getFinancesByCase: async (caseId: string): Promise<FinanceRecord[]> => {
    const { data, error } = await supabase
      .from('finance_records')
      .select('*')
      .eq('case_id', caseId)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

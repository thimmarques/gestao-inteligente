import { FinanceRecord, ClientType } from '../types.ts';
import { supabase } from '../lib/supabase';
import { logAction } from '../utils/auditLogger.ts';

export const financeService = {
  getFinances: async (): Promise<FinanceRecord[]> => {
    const { data, error } = await supabase
      .from('finance_records')
      .select(
        `
        *,
        client:clients(name, type, financial_profile),
        case:cases(process_number, type)
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
        client:clients(name, type, financial_profile),
        case:cases(process_number, type)
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
        client:clients(name, type, financial_profile),
        case:cases(process_number, type)
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

  getFinancesByClient: async (clientId: string): Promise<FinanceRecord[]> => {
    const { data, error } = await supabase
      .from('finance_records')
      .select('*')
      .eq('client_id', clientId)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  syncClientFinances: async (
    clientId: string,
    clientData: any,
    lawyerId: string,
    officeId: string,
    caseId?: string
  ) => {
    // 1. Buscamos registros já existentes para este cliente para limpar o que for "pendente"
    // Isso evita duplicidade em atualizações da configuração financeira
    const { data: allFinancesData, error: fetchError } = await supabase
      .from('finance_records')
      .select('*')
      .eq('client_id', clientId);

    if (fetchError) throw fetchError;
    const allFinances = allFinancesData || [];

    const pendingFinances = allFinances.filter((f) => {
      if (f.status !== 'pendente') return false;
      if (caseId) {
        return f.case_id === caseId || !f.case_id;
      }
      return true;
    });

    // 2. Removemos os pendentes antigos antes de gerar a nova configuração
    if (pendingFinances.length > 0) {
      const { error: deleteError } = await supabase
        .from('finance_records')
        .delete()
        .in(
          'id',
          pendingFinances.map((f) => f.id)
        );

      if (deleteError)
        console.error('Error deleting pending records:', deleteError);
    }

    if (
      clientData.type === ClientType.DEFENSORIA &&
      clientData.financial_profile
    ) {
      const { guia_principal, guia_recurso, tem_recurso } =
        clientData.financial_profile;
      if (guia_principal?.valor) {
        await financeService.createRecord({
          client_id: clientId,
          case_id: caseId,
          lawyer_id: lawyerId,
          office_id: officeId,
          type: 'receita',
          title: `Honorários (Guia 70%) - ${clientData.name}`,
          category: 'Honorários (Guia 70%)',
          amount: parseFloat(guia_principal.valor) || 0,
          due_date: (guia_principal.data
            ? `${guia_principal.data}-10`
            : new Date().toISOString()
          ).split('T')[0],
          status:
            guia_principal.status === 'Pago pelo Estado' ? 'pago' : 'pendente',
          payment_method: 'TED',
          notes: `Voucher: ${guia_principal.protocolo}`,
        });
      }

      if (tem_recurso && guia_recurso?.valor) {
        await financeService.createRecord({
          client_id: clientId,
          case_id: caseId,
          lawyer_id: lawyerId,
          office_id: officeId,
          type: 'receita',
          title: `Honorários (Recurso 30%) - ${clientData.name}`,
          category: 'Honorários (Recurso 30%)',
          amount: parseFloat(guia_recurso.valor) || 0,
          due_date: (guia_recurso.data
            ? `${guia_recurso.data}-10`
            : new Date().toISOString()
          ).split('T')[0],
          status:
            guia_recurso.status === 'Pago pelo Estado' ? 'pago' : 'pendente',
          payment_method: 'TED',
          notes: `Voucher Recurso: ${guia_recurso.protocolo}`,
        });
      }
    } else if (
      clientData.type === ClientType.PARTICULAR &&
      clientData.financial_profile
    ) {
      const fp = clientData.financial_profile;

      // Só cria registro de entrada se ainda não existir um registro "pago" de entrada para este cliente
      const existingPaidEntry = (allFinances || []).find(
        (f) => f.category === 'Entrada de Honorários' && f.status === 'pago'
      );

      if (fp.tem_entrada && fp.valor_entrada && !existingPaidEntry) {
        await financeService.createRecord({
          client_id: clientId,
          case_id: caseId,
          lawyer_id: lawyerId,
          office_id: officeId,
          type: 'receita',
          title: `Entrada de Honorários - ${clientData.name}`,
          category: 'Entrada de Honorários',
          amount: parseFloat(fp.valor_entrada) || 0,
          due_date: (fp.data_entrada || new Date().toISOString()).split('T')[0],
          status: 'pago',
          payment_method: fp.payment_method,
          notes: 'Entrada confirmada no cadastro.',
        });
      }

      const honorariosTotais = parseFloat(fp.honorarios_firmados) || 0;
      const valorEntrada = fp.tem_entrada
        ? parseFloat(fp.valor_entrada) || 0
        : 0;
      const saldoAReceber = honorariosTotais - valorEntrada;
      const numParcelas = parseInt(fp.num_parcelas_restante) || 1;

      if (saldoAReceber > 0 && numParcelas > 0) {
        const valorParcela = saldoAReceber / numParcelas;
        const dataBaseStr =
          fp.data_primeiro_vencimento || new Date().toISOString().split('T')[0];
        const [y, m, d] = dataBaseStr.split('-').map(Number);

        for (let i = 0; i < numParcelas; i++) {
          const dt = new Date(y, m - 1 + i, d);
          const isoDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

          await financeService.createRecord({
            client_id: clientId,
            case_id: caseId,
            lawyer_id: lawyerId,
            office_id: officeId,
            type: 'receita',
            title: `Honorários Parcela ${i + 1}/${numParcelas} - ${clientData.name}`,
            category: `Parcela ${i + 1}/${numParcelas} - Honorários`,
            amount: valorParcela || 0,
            due_date: isoDate,
            status: 'pendente',
            payment_method: fp.payment_method,
            notes: `Parcelamento gerado via ${fp.payment_method}`,
          });
        }
      }
    }
  },
};

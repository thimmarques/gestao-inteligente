
export enum Role {
  ADMIN = 'admin',
  LAWYER = 'lawyer',
  ASSISTANT = 'assistant'
}

export enum ClientType {
  PARTICULAR = 'particular',
  DEFENSORIA = 'defensoria'
}

export enum CaseStatus {
  DISTRIBUIDO = 'distribuído',
  ANDAMENTO = 'andamento',
  SENTENCIADO = 'sentenciado',
  RECURSO = 'recurso',
  ARQUIVADO = 'arquivado',
  ENCERRADO = 'encerrado'
}

export type CaseType = 'cível' | 'trabalhista' | 'criminal' | 'família' | 'tributário' | 'administrativo' | 'previdenciário';

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  role: Role;
  oab?: string;
  photo_url?: string;
  office_id: string;
  phone?: string;
  specialty?: string;
  bio?: string;
}

export interface Office {
  id: string;
  name: string;
  logo_url?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  site?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  notifications: {
    nearDeadlines: boolean;
    urgentDeadlines: boolean;
    hearingsDayBefore: boolean;
    hearingsHourBefore: boolean;
    overduePayments: boolean;
    weeklySummary: boolean;
  };
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '24h' | '12h';
}

export interface ClientFinancialProfile {
  payment_method?: string;
  hourly_rate?: number;
  retainer_fee?: number;
  billing_day?: number;
  process_number?: string;
  comarca?: string;
  appointment_date?: string;
  process_type?: string;
  social_notes?: string;
  has_hipossuficiencia?: boolean;
  housing_status?: string;
  family_income?: number;
  honorarios_firmados?: string;
  tem_entrada?: boolean;
  valor_entrada?: string;
  num_parcelas_restante?: number | string;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  cpf_cnpj: string;
  email?: string;
  phone: string;
  status: 'ativo' | 'inativo';
  photo_url?: string | null;
  process_count: number;
  notes?: string;
  financial_profile?: ClientFinancialProfile;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  client_id: string;
  lawyer_id: string;
  office_id: string;
  process_number: string;
  court: string;
  type: CaseType;
  status: CaseStatus;
  outcome?: 'ganho' | 'perdido' | 'acordo' | 'em_andamento';
  value: number;
  started_at: string;
  ended_at?: string | null;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CaseWithRelations extends Case {
  client?: Client;
  lawyer?: Lawyer;
  deadlines_count: number;
  urgent_deadlines_count: number;
  schedules_count: number;
  finances_balance: number;
}

export interface ScheduleEvent {
  id: string;
  case_id?: string | null;
  lawyer_id: string;
  client_id?: string | null;
  office_id: string;
  title: string;
  description: string;
  type: 'audiência' | 'reunião' | 'prazo' | 'compromisso';
  start_time: string;
  end_time: string;
  location?: string | null;
  virtual_link?: string | null;
  google_event_id?: string | null;
  reminder_sent: boolean;
  status: 'agendado' | 'concluído' | 'cancelado';
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  lawyer_id: string;
  office_id: string;
  client_id?: string | null;
  case_id?: string | null;
  type: 'receita' | 'despesa';
  category: string;
  amount: number;
  due_date: string;
  paid_date?: string | null;
  status: 'pendente' | 'pago' | 'vencido';
  payment_method?: string;
  notes?: string;
  created_at: string;
  // Injected for UI
  client?: { name: string } | null;
  case?: { process_number: string } | null;
}

export interface ForecastMonth {
  month: string;
  monthDate: Date;
  recurring_revenue: number;
  variable_revenue: number;
  projected_revenue: number;
  fixed_expenses: number;
  variable_expenses: number;
  projected_expenses: number;
  projected_balance: number;
  confidence: 'baixa' | 'média' | 'alta';
  is_adjusted?: boolean;
}

export interface Deadline {
  id: string;
  case_id: string;
  lawyer_id: string;
  title: string;
  description: string;
  deadline_date: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  status: 'pendente' | 'concluído' | 'vencido';
  completed_at?: string | null;
  created_at: string;
  case?: {
    process_number: string;
    client: {
      name: string;
    };
  } | null;
}

export interface Report {
  id: string;
  lawyer_id: string;
  type: 'financeiro' | 'produtividade' | 'clientes' | 'prazos';
  period_start: string;
  period_end: string;
  format: 'pdf' | 'excel';
  file_url: string;
  file_size: string;
  created_at: string;
}

export interface DeadlineFilters {
  search: string;
  statusVisual: string[];
  priority: string[];
  caseId?: string;
  lawyerId?: string;
  dateRange?: { start: Date; end: Date };
}

export interface DeadlineSort {
  field: 'deadline_date' | 'priority' | 'process' | 'client' | 'status';
  direction: 'asc' | 'desc';
}

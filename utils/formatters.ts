
export const formatCurrency = (value: number | string | undefined): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === undefined || isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(num);
};

export function parseCurrency(formatted: string): number {
  const cleaned = formatted
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  return parseFloat(cleaned) || 0;
}

export function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const amount = parseFloat(numbers) / 100;
  if (isNaN(amount)) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatCPF = (v: string) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  }
  return v;
};

export const formatPhone = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function estimateFileSize(fileName: string): number {
  if (fileName.endsWith('.pdf')) {
    return 500000 + Math.random() * 1000000; // 500KB - 1.5MB
  }
  return 200000 + Math.random() * 300000; // 200KB - 500KB
}

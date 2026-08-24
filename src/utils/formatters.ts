/**
 * Brazilian Real Currency & Date formatters and helpers
 */

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCurrencyWithoutSymbol(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  // clean everything except digits, minus, and comma/dot
  const cleaned = input
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`) : dateString;
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateShort(dateString: string | Date | undefined | null): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`) : dateString;
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

export function getGreeting(userName?: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Olá';
  if (hour >= 5 && hour < 12) {
    timeGreeting = 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    timeGreeting = 'Boa tarde';
  } else {
    timeGreeting = 'Boa noite';
  }
  return userName ? `${timeGreeting}, ${userName}` : timeGreeting;
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex] || '';
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

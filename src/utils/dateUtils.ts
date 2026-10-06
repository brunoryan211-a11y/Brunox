export function formatDateBR(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateString: string, days: number): string {
  const parts = dateString.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(targetDateString: string, baseDateString?: string): number {
  const base = baseDateString ? parseDateString(baseDateString) : new Date();
  const target = parseDateString(targetDateString);
  
  // Set both to midnight for pure day comparison
  base.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function parseDateString(str: string): Date {
  const parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

export function isLoanOverdue(dueDateString: string): boolean {
  return getDaysDifference(dueDateString) < 0;
}

export function getDueStatus(dueDateString: string): {
  isOverdue: boolean;
  daysRemaining: number;
  label: string;
  badgeClass: string;
} {
  const diff = getDaysDifference(dueDateString);
  
  if (diff < 0) {
    const overdueDays = Math.abs(diff);
    return {
      isOverdue: true,
      daysRemaining: diff,
      label: overdueDays === 1 ? 'Atrasado há 1 dia' : `Atrasado há ${overdueDays} dias`,
      badgeClass: 'text-rose-700 bg-rose-50 border border-rose-200',
    };
  } else if (diff === 0) {
    return {
      isOverdue: false,
      daysRemaining: 0,
      label: 'Vence hoje!',
      badgeClass: 'text-amber-800 bg-amber-50 border border-amber-200',
    };
  } else if (diff === 1) {
    return {
      isOverdue: false,
      daysRemaining: 1,
      label: 'Vence amanhã',
      badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    };
  } else {
    return {
      isOverdue: false,
      daysRemaining: diff,
      label: `Faltam ${diff} dias`,
      badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    };
  }
}

export function getBorrowedSinceLabel(borrowedDateString: string): string {
  const diff = -getDaysDifference(borrowedDateString);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  return `Há ${diff} dias`;
}

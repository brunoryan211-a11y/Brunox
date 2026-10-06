import { Book, LoanHistoryItem } from '../types';
import { INITIAL_BOOKS, INITIAL_HISTORY, DEFAULT_CLASSES } from '../data/seedData';
import { formatDateBR, isLoanOverdue } from './dateUtils';

const STORAGE_KEY_BOOKS = 'biblioteca_livros_v1';
const STORAGE_KEY_HISTORY = 'biblioteca_historico_v1';
const STORAGE_KEY_CLASSES = 'biblioteca_turmas_v1';

export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (!raw) {
      saveBooks(INITIAL_BOOKS);
      return INITIAL_BOOKS;
    }
    const loaded: Book[] = JSON.parse(raw);
    // Backfill ISBN if missing from initial data
    const updated = loaded.map((b) => {
      if (!b.isbn) {
        const found = INITIAL_BOOKS.find((init) => init.id === b.id || init.code === b.code);
        if (found?.isbn) {
          return { ...b, isbn: found.isbn };
        }
      }
      return b;
    });
    return updated;
  } catch (err) {
    console.error('Erro ao carregar livros:', err);
    return INITIAL_BOOKS;
  }
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (err) {
    console.error('Erro ao salvar livros:', err);
  }
}

export function loadHistory(): LoanHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      saveHistory(INITIAL_HISTORY);
      return INITIAL_HISTORY;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
    return INITIAL_HISTORY;
  }
}

export function saveHistory(history: LoanHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Erro ao salvar histórico:', err);
  }
}

export function loadClasses(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      saveClasses(DEFAULT_CLASSES);
      return DEFAULT_CLASSES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao carregar turmas:', err);
    return DEFAULT_CLASSES;
  }
}

export function saveClasses(classes: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
  } catch (err) {
    console.error('Erro ao salvar turmas:', err);
  }
}

export function exportBooksToCSV(books: Book[]): void {
  const headers = [
    'Código/Tombo',
    'ISBN / Código de Barras',
    'Título',
    'Autor',
    'Gênero',
    'Localização/Estante',
    'Status Atual',
    'Quem Pegou',
    'Turma',
    'Data Empréstimo',
    'Prazo Devolução',
    'Situação do Prazo',
    'Observações',
  ];

  const rows = books.map((b) => {
    const status = b.isBorrowed ? 'Emprestado' : 'Na Biblioteca (Disponível)';
    const student = b.currentLoan?.studentName || '-';
    const studentClass = b.currentLoan?.studentClass || '-';
    const borrowedDate = b.currentLoan ? formatDateBR(b.currentLoan.borrowedDate) : '-';
    const dueDate = b.currentLoan ? formatDateBR(b.currentLoan.dueDate) : '-';
    let prazoSituacao = '-';
    if (b.currentLoan) {
      prazoSituacao = isLoanOverdue(b.currentLoan.dueDate) ? 'ATRASADO' : 'No Prazo';
    }
    const notes = b.notes || (b.currentLoan?.notes ?? '');

    return [
      `"${b.code.replace(/"/g, '""')}"`,
      `"${(b.isbn || '').replace(/"/g, '""')}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.genre.replace(/"/g, '""')}"`,
      `"${b.location.replace(/"/g, '""')}"`,
      `"${status}"`,
      `"${student.replace(/"/g, '""')}"`,
      `"${studentClass.replace(/"/g, '""')}"`,
      `"${borrowedDate}"`,
      `"${dueDate}"`,
      `"${prazoSituacao}"`,
      `"${notes.replace(/"/g, '""')}"`,
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_biblioteca_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

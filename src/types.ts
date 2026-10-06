export interface CurrentLoan {
  id: string;
  studentName: string;
  studentClass: string; // "Turma" (ex: "7º Ano B", "9º Ano A", "3º Ensino Médio")
  borrowedDate: string; // YYYY-MM-DD
  dueDate: string;      // YYYY-MM-DD
  notes?: string;
  renewCount: number;
}

export interface LoanHistoryItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCode: string;
  studentName: string;
  studentClass: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate: string;
  notes?: string;
  wasLate: boolean;
}

export interface BookReservation {
  id: string;
  bookId: string;
  studentName: string;
  studentClass: string;
  requestDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface Book {
  id: string;
  code: string;       // Código / Tombo (ex: LIV-001)
  isbn?: string;      // Código de Barras / ISBN (ex: 9788535902778)
  title: string;
  author: string;
  genre: string;      // Ficção, Literatura Brasileira, etc.
  location: string;   // ex: "Estante 2 - Prateleira A"
  coverColor: string; // Cor temática do livro
  notes?: string;
  isBorrowed: boolean;
  currentLoan?: CurrentLoan;
  reservations?: BookReservation[];
  rating?: number;    // Avaliação média (ex: 4.8)
  pages?: number;     // Páginas (ex: 256)
  isFeatured?: boolean; // Livro recomendado em destaque
}

export type UserRole = 'admin' | 'reader';

export type NotificationType = 'overdue' | 'due_today' | 'due_soon';

export interface DueNotification {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCode: string;
  isbn?: string;
  readerName: string;
  readerClass: string;
  dueDate: string;
  borrowedDate: string;
  type: NotificationType;
  daysDifference: number;
  message: string;
}

export type ViewMode = 'grid' | 'table';
export type ActiveTab = 'all' | 'available' | 'borrowed' | 'overdue' | 'by-class' | 'history';


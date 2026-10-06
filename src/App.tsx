import React, { useState, useEffect, useMemo } from 'react';
import {
  Book,
  LoanHistoryItem,
  ActiveTab,
  ViewMode,
  CurrentLoan,
  DueNotification,
  UserRole,
  BookReservation,
} from './types';
import {
  loadBooks,
  saveBooks,
  loadHistory,
  saveHistory,
  loadClasses,
  saveClasses,
  exportBooksToCSV,
} from './utils/storage';
import { INITIAL_BOOKS, INITIAL_HISTORY } from './data/seedData';
import { getTodayDateString, addDaysToDate, isLoanOverdue, formatDateBR } from './utils/dateUtils';
import { generateDueNotifications, buildReaderNotificationText } from './utils/notificationUtils';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { BookCard } from './components/BookCard';
import { BookTable } from './components/BookTable';
import { ClassGroupView } from './components/ClassGroupView';
import { HistoryView } from './components/HistoryView';
import { ReaderPortal } from './components/ReaderPortal';
import { ReaderBookDetailModal } from './components/ReaderBookDetailModal';
import { AdminTopBanner } from './components/AdminTopBanner';
import { AdminLoginModal } from './components/AdminLoginModal';
import { LoanModal } from './components/LoanModal';
import { BookModal } from './components/BookModal';
import { BookDetailModal } from './components/BookDetailModal';
import { NoticeModal } from './components/NoticeModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import {
  BookOpen,
  RefreshCw,
  AlertTriangle,
  Bell,
  ScanBarcode,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY_ROLE = 'biblioteca_papel_usuario';
const STORAGE_KEY_FAVORITES = 'biblioteca_favoritos';
const STORAGE_KEY_AUTH = 'biblioteca_admin_auth_v1';

export default function App() {
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Role Mode: 'admin' (Gestão & Empréstimos) vs 'reader' (Biblioteca Digital dos Usuários)
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved === 'admin') {
        const isAuth = sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
        return isAuth ? 'admin' : 'reader';
      }
      return 'reader';
    } catch {
      return 'reader';
    }
  });

  // Reader Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Main Database State
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [history, setHistory] = useState<LoanHistoryItem[]>(() => loadHistory());
  const [classes, setClasses] = useState<string[]>(() => loadClasses());

  // Navigation & Filtering (Admin mode)
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [sortBy, setSortBy] = useState('status');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals - Administrative
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [bookForLoan, setBookForLoan] = useState<Book | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [initialBookDataForCreation, setInitialBookDataForCreation] = useState<Partial<Book> | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null);

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [bookForNotice, setBookForNotice] = useState<Book | null>(null);

  // Modals - Barcode & Notifications
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Modals - Reader Portal
  const [isReaderDetailModalOpen, setIsReaderDetailModalOpen] = useState(false);
  const [selectedReaderBook, setSelectedReaderBook] = useState<Book | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to LocalStorage & SessionStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, userRole);
    } catch {}
  }, [userRole]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_AUTH, String(isAdminAuthenticated));
    } catch {}
  }, [isAdminAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveClasses(classes);
  }, [classes]);

  // Derived: Available classes list
  const allAvailableClasses = useMemo(() => {
    const set = new Set(classes);
    books.forEach((b) => {
      if (b.currentLoan?.studentClass) {
        set.add(b.currentLoan.studentClass);
      }
    });
    return Array.from(set).sort();
  }, [classes, books]);

  // Due Notifications
  const dueNotifications = useMemo(() => {
    return generateDueNotifications(books);
  }, [books]);

  const overdueCount = useMemo(() => {
    return dueNotifications.filter((n) => n.type === 'overdue').length;
  }, [dueNotifications]);

  const dueTodayCount = useMemo(() => {
    return dueNotifications.filter((n) => n.type === 'due_today').length;
  }, [dueNotifications]);

  // Filtered and Sorted books (for Admin view)
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (activeTab === 'available') {
      result = result.filter((b) => !b.isBorrowed);
    } else if (activeTab === 'borrowed') {
      result = result.filter((b) => b.isBorrowed);
    } else if (activeTab === 'overdue') {
      result = result.filter((b) => b.isBorrowed && b.currentLoan && isLoanOverdue(b.currentLoan.dueDate));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q);
        const authorMatch = b.author.toLowerCase().includes(q);
        const codeMatch = b.code.toLowerCase().includes(q);
        const isbnMatch = b.isbn ? b.isbn.toLowerCase().includes(q) : false;
        const genreMatch = b.genre.toLowerCase().includes(q);
        const studentMatch = b.currentLoan?.studentName.toLowerCase().includes(q);
        const classMatch = b.currentLoan?.studentClass.toLowerCase().includes(q);
        return titleMatch || authorMatch || codeMatch || isbnMatch || genreMatch || studentMatch || classMatch;
      });
    }

    if (selectedClass) {
      result = result.filter((b) => b.currentLoan?.studentClass === selectedClass);
    }

    result.sort((a, b) => {
      if (sortBy === 'status') {
        if (a.isBorrowed && !b.isBorrowed) return -1;
        if (!a.isBorrowed && b.isBorrowed) return 1;
        if (a.isBorrowed && b.isBorrowed && a.currentLoan && b.currentLoan) {
          const aOverdue = isLoanOverdue(a.currentLoan.dueDate);
          const bOverdue = isLoanOverdue(b.currentLoan.dueDate);
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          return a.currentLoan.dueDate.localeCompare(b.currentLoan.dueDate);
        }
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      if (sortBy === 'dueDate') {
        if (!a.currentLoan) return 1;
        if (!b.currentLoan) return -1;
        return a.currentLoan.dueDate.localeCompare(b.currentLoan.dueDate);
      }
      return 0;
    });

    return result;
  }, [books, activeTab, searchQuery, selectedClass, sortBy]);

  // Authentication Handlers
  const handleRequestAdminAccess = () => {
    if (isAdminAuthenticated) {
      setUserRole('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleSuccessAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setUserRole('admin');
    addToast('success', 'Acesso autorizado!', 'Bem-vindo ao Painel de Administração.');
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setUserRole('reader');
    addToast('info', 'Sessão encerrada', 'Você está navegando como Leitor.');
  };

  // Actions
  const handleToggleFavorite = (bookId: string) => {
    setFavorites((prev) => {
      if (prev.includes(bookId)) {
        addToast('info', 'Removido dos favoritos');
        return prev.filter((id) => id !== bookId);
      } else {
        addToast('success', 'Salvo na sua lista de desejos!');
        return [...prev, bookId];
      }
    });
  };

  const handleOpenLoan = (book?: Book) => {
    setBookForLoan(book || null);
    setIsLoanModalOpen(true);
  };

  const handleConfirmLoan = (bookId: string, loanData: Omit<CurrentLoan, 'id' | 'renewCount'>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const newLoan: CurrentLoan = {
            ...loanData,
            id: `emp-${Date.now()}`,
            renewCount: 0,
          };
          const updatedReservations = (b.reservations || []).filter(
            (r) => r.studentName.toLowerCase() !== loanData.studentName.toLowerCase()
          );

          return {
            ...b,
            isBorrowed: true,
            currentLoan: newLoan,
            reservations: updatedReservations,
          };
        }
        return b;
      })
    );

    if (loanData.studentClass && !classes.includes(loanData.studentClass)) {
      setClasses((prev) => [...prev, loanData.studentClass]);
    }

    const loanedBook = books.find((b) => b.id === bookId);
    addToast(
      'success',
      'Empréstimo registrado com sucesso!',
      `"${loanedBook?.title || 'Livro'}" emprestado para ${loanData.studentName} (${loanData.studentClass}).`
    );
  };

  const handleReturnBook = (book: Book) => {
    if (!book.isBorrowed || !book.currentLoan) return;

    const today = getTodayDateString();
    const wasLate = isLoanOverdue(book.currentLoan.dueDate);

    const historyItem: LoanHistoryItem = {
      id: `hist-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      bookCode: book.code,
      studentName: book.currentLoan.studentName,
      studentClass: book.currentLoan.studentClass,
      borrowedDate: book.currentLoan.borrowedDate,
      dueDate: book.currentLoan.dueDate,
      returnedDate: today,
      notes: book.currentLoan.notes,
      wasLate,
    };

    setHistory((prev) => [historyItem, ...prev]);

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === book.id) {
          return {
            ...b,
            isBorrowed: false,
            currentLoan: undefined,
          };
        }
        return b;
      })
    );

    const hasReservations = book.reservations && book.reservations.length > 0;
    addToast(
      'success',
      'Livro devolvido à biblioteca!',
      hasReservations
        ? `"${book.title}" está na estante! Atenção: há ${book.reservations?.length} aluno(s) na lista de espera.`
        : `"${book.title}" está novamente disponível na estante.`
    );
  };

  const handleRenewLoan = (book: Book) => {
    if (!book.isBorrowed || !book.currentLoan) return;

    const currentDue = book.currentLoan.dueDate;
    const newDue = addDaysToDate(currentDue, 7);

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === book.id && b.currentLoan) {
          return {
            ...b,
            currentLoan: {
              ...b.currentLoan,
              dueDate: newDue,
              renewCount: (b.currentLoan.renewCount || 0) + 1,
            },
          };
        }
        return b;
      })
    );

    addToast(
      'info',
      'Empréstimo Renovado!',
      `Prazo estendido por mais 7 dias até ${formatDateBR(newDue)}.`
    );
  };

  const handleSaveBook = (bookData: Partial<Book>) => {
    if (bookToEdit) {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id === bookToEdit.id) {
            return {
              ...b,
              ...bookData,
            } as Book;
          }
          return b;
        })
      );
      addToast('success', 'Livro atualizado!', `Dados de "${bookData.title}" foram salvos.`);
    } else {
      const newBook: Book = {
        id: `liv-${Date.now()}`,
        code: bookData.code || `LIV-${Date.now().toString().slice(-4)}`,
        isbn: bookData.isbn || '',
        title: bookData.title || '',
        author: bookData.author || '',
        genre: bookData.genre || 'Literatura',
        location: bookData.location || 'Estante Geral',
        coverColor: bookData.coverColor || '#1e3a5f',
        notes: bookData.notes || '',
        rating: 4.8,
        pages: 200,
        isFeatured: true,
        isBorrowed: false,
      };
      setBooks((prev) => [newBook, ...prev]);
      addToast('success', 'Novo livro cadastrado!', `"${newBook.title}" adicionado ao acervo.`);
    }
    setInitialBookDataForCreation(null);
  };

  const handleDeleteBook = (bookId: string) => {
    const bookToDelete = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    addToast('info', 'Livro removido do acervo', `"${bookToDelete?.title || 'Exemplar'}" foi excluído.`);
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Deseja restaurar os dados de exemplo da biblioteca com livros e empréstimos demonstrativos?'
      )
    ) {
      setBooks(INITIAL_BOOKS);
      setHistory(INITIAL_HISTORY);
      addToast('info', 'Dados restaurados com sucesso!');
    }
  };

  const handleOpenNotice = (book: Book) => {
    setBookForNotice(book);
    setIsNoticeModalOpen(true);
  };

  const handleNotifyWhatsAppFromNotification = (notification: DueNotification) => {
    const text = buildReaderNotificationText(notification);
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    addToast('info', 'Lembrete enviado!', `Mensagem gerada para ${notification.readerName}.`);
  };

  const handleRegisterNewBookFromScan = (prefilled: Partial<Book>) => {
    setBookToEdit(null);
    setInitialBookDataForCreation(prefilled);
    setIsBookModalOpen(true);
  };

  const handleRequestReservation = (
    bookId: string,
    reservationData: Omit<BookReservation, 'id' | 'requestDate'>
  ) => {
    const newReservation: BookReservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      requestDate: getTodayDateString(),
    };

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const list = b.reservations || [];
          return {
            ...b,
            reservations: [...list, newReservation],
          };
        }
        return b;
      })
    );

    addToast(
      'success',
      'Reserva Registrada!',
      `Seu interesse foi salvo. A biblioteca reservará o livro para ${reservationData.studentName}.`
    );
  };

  const availableBooksList = useMemo(() => books.filter((b) => !b.isBorrowed), [books]);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* Top Header with Role Switcher & Protected Access */}
      <Header
        userRole={userRole}
        setUserRole={(role) => {
          if (role === 'admin' && !isAdminAuthenticated) {
            setIsAdminLoginModalOpen(true);
          } else {
            setUserRole(role);
          }
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        onRequestAdminAccess={handleRequestAdminAccess}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenNewLoan={() => handleOpenLoan()}
        onOpenNewBook={() => {
          setBookToEdit(null);
          setInitialBookDataForCreation(null);
          setIsBookModalOpen(true);
        }}
        onOpenBarcodeScanner={() => setIsBarcodeModalOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onExportCSV={() => exportBooksToCSV(books)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueCount={overdueCount}
        pendingNotificationsCount={dueNotifications.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {userRole === 'reader' ? (
          /* ========================================================= */
          /* PORTAL DO LEITOR / BIBLIOTECA DIGITAL PARA USUÁRIOS      */
          /* ========================================================= */
          <ReaderPortal
            books={books}
            onSelectBook={(book) => {
              setSelectedReaderBook(book);
              setIsReaderDetailModalOpen(true);
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSwitchToAdmin={handleRequestAdminAccess}
          />
        ) : (
          /* ========================================================= */
          /* PAINEL ADMINISTRATIVO (GESTÃO, EMPRÉSTIMOS E DEVOLUÇÕES)  */
          /* ========================================================= */
          <>
            {/* PROMINENT HIGH-VISIBILITY TOP BANNER WITH LOAN BUTTON & CLICKABLE STATS */}
            <AdminTopBanner
              onOpenNewLoan={() => handleOpenLoan()}
              onOpenBarcodeScanner={() => setIsBarcodeModalOpen(true)}
              onOpenNewBook={() => {
                setBookToEdit(null);
                setInitialBookDataForCreation(null);
                setIsBookModalOpen(true);
              }}
              onOpenNotifications={() => setIsNotificationModalOpen(true)}
              onLogoutAdmin={handleLogoutAdmin}
              availableCount={books.filter((b) => !b.isBorrowed).length}
              borrowedCount={books.filter((b) => b.isBorrowed).length}
              overdueCount={overdueCount}
              totalCount={books.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Quick summary stats cards (also fully clickable with explicit instructions) */}
            <StatsBar books={books} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Dynamic Return Reminder Notification Banner */}
            {dueNotifications.length > 0 && (
              <div
                onClick={() => setIsNotificationModalOpen(true)}
                className={`mb-6 p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
                  overdueCount > 0
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950 hover:bg-rose-100/80'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-100/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      overdueCount > 0
                        ? 'bg-rose-200/90 text-rose-800'
                        : 'bg-amber-200/90 text-amber-800'
                    }`}
                  >
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold truncate">
                        {overdueCount > 0
                          ? `${overdueCount} livro(s) com devolução em atraso!`
                          : `${dueTodayCount} livro(s) com devolução prevista para hoje!`}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/80 shrink-0">
                        Lembretes Automáticos
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 truncate mt-0.5">
                      Clique aqui para abrir a Central de Notificações, enviar lembretes aos leitores ou registrar devoluções.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold shrink-0">
                  <span className="hidden sm:inline">Ver Notificações</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Target anchor for scrolling when clicking buttons */}
            <div id="livros-lista" className="scroll-mt-24">
              {/* Contextual Filter Indicator Banners */}
              {activeTab === 'overdue' && (
                <div className="mb-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-rose-950">
                        Filtrando Livros em Atraso ({filteredBooks.length} pendentes)
                      </h4>
                      <p className="text-xs text-rose-800">
                        Veja abaixo exatamente <strong>quem está com cada livro atrasado</strong>, a <strong>turma</strong> e <strong>há quantos dias venceu</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-xs font-bold text-rose-800 hover:bg-rose-100 cursor-pointer shadow-2xs shrink-0"
                  >
                    Ver Todo o Acervo
                  </button>
                </div>
              )}

              {activeTab === 'borrowed' && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Filtrando Livros Emprestados ({filteredBooks.length} com alunos)
                      </h4>
                      <p className="text-xs text-amber-800">
                        Veja abaixo <strong>quem pegou cada livro</strong>, a <strong>turma</strong>, <strong>quando retirou</strong> e a <strong>data de devolução</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer shadow-2xs shrink-0"
                  >
                    Ver Todo o Acervo
                  </button>
                </div>
              )}

              {activeTab === 'available' && (
                <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Filtrando Livros Disponíveis na Biblioteca ({filteredBooks.length} na estante)
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Todos os exemplares abaixo estão guardados na biblioteca e podem ser emprestados agora.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer shadow-2xs shrink-0"
                  >
                    Ver Todo o Acervo
                  </button>
                </div>
              )}
            </div>

            {/* Tab: By Class */}
            {activeTab === 'by-class' ? (
              <ClassGroupView
                books={books}
                onReturnBook={handleReturnBook}
                onRenewLoan={handleRenewLoan}
                onViewDetails={(b) => {
                  setSelectedBookDetail(b);
                  setIsDetailModalOpen(true);
                }}
              />
            ) : activeTab === 'history' ? (
              /* Tab: Loan History */
              <HistoryView history={history} />
            ) : (
              /* Main Views: All, Available, Borrowed, Overdue */
              <>
                <FilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  availableClasses={allAvailableClasses}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  totalFiltered={filteredBooks.length}
                />

                {filteredBooks.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center my-6 shadow-2xs">
                    <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-serif font-bold text-lg text-stone-800">
                      Nenhum livro encontrado
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Tente alterar os filtros de busca, escanear o código de barras ou cadastrar novos livros no acervo.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedClass('');
                          setActiveTab('all');
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={() => setIsBarcodeModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
                      >
                        <ScanBarcode className="w-3.5 h-3.5 text-amber-800" />
                        <span>Escanear Código</span>
                      </button>
                      <button
                        onClick={() => {
                          setBookToEdit(null);
                          setInitialBookDataForCreation(null);
                          setIsBookModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-800 hover:bg-amber-900 text-white cursor-pointer"
                      >
                        + Cadastrar Livro
                      </button>
                    </div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onOpenLoan={(b) => handleOpenLoan(b)}
                        onReturnBook={handleReturnBook}
                        onRenewLoan={handleRenewLoan}
                        onViewDetails={(b) => {
                          setSelectedBookDetail(b);
                          setIsDetailModalOpen(true);
                        }}
                        onCopyReminderMessage={handleOpenNotice}
                      />
                    ))}
                  </div>
                ) : (
                  <BookTable
                    books={filteredBooks}
                    onOpenLoan={(b) => handleOpenLoan(b)}
                    onReturnBook={handleReturnBook}
                    onRenewLoan={handleRenewLoan}
                    onViewDetails={(b) => {
                      setSelectedBookDetail(b);
                      setIsDetailModalOpen(true);
                    }}
                    onCopyReminderMessage={handleOpenNotice}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Biblioteca Escolar</span>
            <span>·</span>
            <span>{books.length} exemplares no acervo</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">
              {books.filter((b) => !b.isBorrowed).length} disponíveis
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (userRole === 'admin') {
                  setUserRole('reader');
                } else {
                  handleRequestAdminAccess();
                }
              }}
              className="text-[11px] font-semibold text-stone-700 hover:text-stone-900 underline cursor-pointer"
            >
              {userRole === 'admin'
                ? 'Visualizar como Leitor (Biblioteca Digital)'
                : 'Acessar Área do Administrador (com senha)'}
            </button>
            <button
              onClick={handleResetDemoData}
              className="text-[11px] text-stone-400 hover:text-stone-700 underline inline-flex items-center gap-1 cursor-pointer"
              title="Recarregar acervo escolar de demonstração"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar dados de exemplo</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal (Protected credentials: BibliotecaErem2025 / 1503) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccessLogin={handleSuccessAdminLogin}
      />

      {/* Modals - Reader Portal */}
      <ReaderBookDetailModal
        isOpen={isReaderDetailModalOpen}
        onClose={() => setIsReaderDetailModalOpen(false)}
        book={selectedReaderBook}
        allBooks={books}
        onSelectRecommendedBook={(rec) => {
          setSelectedReaderBook(rec);
        }}
        onRequestReservation={handleRequestReservation}
        isFavorited={selectedReaderBook ? favorites.includes(selectedReaderBook.id) : false}
        onToggleFavorite={handleToggleFavorite}
        availableClasses={allAvailableClasses}
      />

      {/* Modals - Administration */}
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        bookToLoan={bookForLoan}
        availableBooks={availableBooksList}
        availableClasses={allAvailableClasses}
        onSubmitLoan={handleConfirmLoan}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setInitialBookDataForCreation(null);
        }}
        bookToEdit={bookToEdit}
        initialData={initialBookDataForCreation}
        onSaveBook={handleSaveBook}
        totalBooksCount={books.length}
      />

      <BookDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        book={selectedBookDetail}
        history={history}
        onOpenLoan={(b) => handleOpenLoan(b)}
        onReturnBook={handleReturnBook}
        onRenewLoan={handleRenewLoan}
        onEditBook={(b) => {
          setBookToEdit(b);
          setInitialBookDataForCreation(null);
          setIsBookModalOpen(true);
        }}
        onDeleteBook={handleDeleteBook}
        onCopyReminderMessage={handleOpenNotice}
      />

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        book={bookForNotice}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        books={books}
        onOpenLoan={(b) => handleOpenLoan(b)}
        onReturnBook={handleReturnBook}
        onRenewLoan={handleRenewLoan}
        onRegisterNewBookWithDetails={handleRegisterNewBookFromScan}
        onViewDetails={(b) => {
          if (userRole === 'reader') {
            setSelectedReaderBook(b);
            setIsReaderDetailModalOpen(true);
          } else {
            setSelectedBookDetail(b);
            setIsDetailModalOpen(true);
          }
        }}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={dueNotifications}
        books={books}
        onReturnBook={handleReturnBook}
        onRenewLoan={handleRenewLoan}
        onViewDetails={(b) => {
          setSelectedBookDetail(b);
          setIsDetailModalOpen(true);
        }}
        onNotifyWhatsApp={handleNotifyWhatsAppFromNotification}
      />

      {/* Toast Feedback */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

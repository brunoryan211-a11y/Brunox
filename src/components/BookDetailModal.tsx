import React from 'react';
import { Book, LoanHistoryItem } from '../types';
import { formatDateBR, getBorrowedSinceLabel, getDueStatus } from '../utils/dateUtils';
import {
  X,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  RotateCcw,
  MapPin,
  Edit,
  Trash2,
  History,
  MessageCircle,
} from 'lucide-react';

interface BookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  history: LoanHistoryItem[];
  onOpenLoan: (book: Book) => void;
  onReturnBook: (book: Book) => void;
  onRenewLoan: (book: Book) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onCopyReminderMessage: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  isOpen,
  onClose,
  book,
  history,
  onOpenLoan,
  onReturnBook,
  onRenewLoan,
  onEditBook,
  onDeleteBook,
  onCopyReminderMessage,
}) => {
  if (!isOpen || !book) return null;

  const isBorrowed = book.isBorrowed && !!book.currentLoan;
  const loan = book.currentLoan;
  const dueStatus = loan ? getDueStatus(loan.dueDate) : null;
  const bookHistory = history.filter((h) => h.bookId === book.id);

  const handleDelete = () => {
    if (
      window.confirm(
        `Tem certeza de que deseja remover o livro "${book.title}" (${book.code}) do acervo?`
      )
    ) {
      onDeleteBook(book.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-xl overflow-hidden my-8">
        {/* Header with Book Spine color */}
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: book.coverColor || '#1e3a5f' }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold tracking-wider text-white/90">
            <span className="bg-black/30 px-2 py-0.5 rounded backdrop-blur-xs">
              {book.code}
            </span>
            {book.isbn && (
              <>
                <span>·</span>
                <span className="bg-black/20 px-2 py-0.5 rounded backdrop-blur-xs">
                  ISBN {book.isbn}
                </span>
              </>
            )}
            <span>·</span>
            <span>{book.genre}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight leading-snug">
            {book.title}
          </h2>
          <p className="text-sm text-white/80 mt-1 font-medium">{book.author}</p>
        </div>

        {/* Status Alert Banner */}
        <div className="px-6 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-semibold uppercase text-[10px]">
              Status Atual:
            </span>
            {isBorrowed ? (
              <span
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${
                  dueStatus?.isOverdue
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{dueStatus?.isOverdue ? 'Emprestado (Atrasado)' : 'Emprestado'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Na Biblioteca (Disponível)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>{book.location}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Current Loan Box (if borrowed) */}
          {isBorrowed && loan ? (
            <div
              className={`p-4 rounded-xl border ${
                dueStatus?.isOverdue
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-stone-600" />
                <span>Com quem está este livro:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">
                    Aluno / Leitor:
                  </span>
                  <p className="font-bold text-stone-900 text-sm mt-0.5">{loan.studentName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">
                    Turma / Sala:
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 font-bold text-stone-800">
                    <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                    <span>{loan.studentClass}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">
                    Data em que pegou:
                  </span>
                  <p className="font-semibold text-stone-800 mt-0.5">
                    {formatDateBR(loan.borrowedDate)}{' '}
                    <span className="font-normal text-stone-500 text-[11px]">
                      ({getBorrowedSinceLabel(loan.borrowedDate)})
                    </span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-semibold">
                    Prazo para devolução:
                  </span>
                  <p
                    className={`font-bold mt-0.5 ${
                      dueStatus?.isOverdue ? 'text-rose-700' : 'text-stone-900'
                    }`}
                  >
                    {formatDateBR(loan.dueDate)} · {dueStatus?.label}
                  </p>
                </div>
              </div>

              {loan.notes && (
                <div className="mt-3 pt-2.5 border-t border-stone-200/80 text-xs text-stone-600">
                  <span className="font-semibold text-stone-700">Obs do Empréstimo: </span>
                  <span>{loan.notes}</span>
                </div>
              )}

              {/* Fast loan actions */}
              <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onReturnBook(book);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Devolver à Biblioteca Agora</span>
                </button>

                <button
                  onClick={() => onRenewLoan(book)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Renovar (+7 dias)</span>
                </button>

                <button
                  onClick={() => onCopyReminderMessage(book)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Copiar Cobrança / WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  Este livro está disponível na biblioteca
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Localização: {book.location}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenLoan(book);
                }}
                className="px-4 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Emprestar Livro</span>
              </button>
            </div>
          )}

          {/* Book Notes */}
          {book.notes && (
            <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="font-bold text-stone-700 block mb-0.5">Observações do Exemplar:</span>
              <p>{book.notes}</p>
            </div>
          )}

          {/* Loan History for this book */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              <History className="w-4 h-4 text-stone-500" />
              <span>Histórico de Empréstimos Anteriores ({bookHistory.length})</span>
            </div>

            {bookHistory.length === 0 ? (
              <p className="text-xs text-stone-400 italic">
                Nenhuma devolução anterior registrada para este livro.
              </p>
            ) : (
              <div className="space-y-2">
                {bookHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-stone-900">{item.studentName}</span>{' '}
                      <span className="text-stone-500">({item.studentClass})</span>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Retirada: {formatDateBR(item.borrowedDate)} · Devolvido: {formatDateBR(item.returnedDate)}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.wasLate
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.wasLate ? 'Devolvido com atraso' : 'Devolvido no prazo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Livro</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditBook(book);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Dados</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

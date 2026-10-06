import React from 'react';
import {
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  MessageCircle,
  MapPin,
  Bookmark,
} from 'lucide-react';
import { Book } from '../types';
import { formatDateBR, getBorrowedSinceLabel, getDueStatus } from '../utils/dateUtils';

interface BookCardProps {
  book: Book;
  onOpenLoan: (book: Book) => void;
  onReturnBook: (book: Book) => void;
  onRenewLoan: (book: Book) => void;
  onViewDetails: (book: Book) => void;
  onCopyReminderMessage: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpenLoan,
  onReturnBook,
  onRenewLoan,
  onViewDetails,
  onCopyReminderMessage,
}) => {
  const isBorrowed = book.isBorrowed && !!book.currentLoan;
  const loan = book.currentLoan;
  const dueStatus = loan ? getDueStatus(loan.dueDate) : null;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isBorrowed
          ? dueStatus?.isOverdue
            ? 'bg-rose-50/30 border-rose-200 shadow-xs hover:border-rose-300 hover:shadow-sm'
            : 'bg-amber-50/20 border-amber-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm'
          : 'bg-white border-stone-200 shadow-2xs hover:border-stone-300 hover:shadow-xs'
      }`}
    >
      {/* Top Header Strip with Spine Color & Status */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          {/* Book Code & Genre */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-mono font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
              {book.code}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[140px] text-stone-600">{book.genre}</span>
          </div>

          {/* Current Status Indicator */}
          {isBorrowed ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
                dueStatus?.isOverdue
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100/80 text-amber-900 border border-amber-200/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{dueStatus?.isOverdue ? 'Atrasado' : 'Emprestado'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Na Biblioteca</span>
            </div>
          )}
        </div>

        {/* Book Title & Author */}
        <div className="flex items-start gap-3">
          {/* Decorative mini cover spine */}
          <div
            className="w-4 h-14 rounded-xs shrink-0 shadow-xs opacity-90 border-r border-black/10"
            style={{ backgroundColor: book.coverColor || '#78350f' }}
            title={`Gênero: ${book.genre}`}
          />

          <div className="flex-1 min-w-0">
            <h3
              onClick={() => onViewDetails(book)}
              className="font-serif text-base font-bold text-stone-900 line-clamp-2 leading-snug cursor-pointer hover:text-amber-900 transition-colors"
            >
              {book.title}
            </h3>
            <p className="text-xs text-stone-600 font-medium truncate mt-0.5">
              {book.author}
            </p>

            {/* Location & ISBN in library */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1.5 truncate">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{book.location || 'Acervo Geral'}</span>
              {book.isbn && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[10px] text-stone-400">ISBN {book.isbn}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distinction Section: WHO HAS THE BOOK vs AVAILABLE IN LIBRARY */}
      <div className="px-4 py-3 border-t border-dashed border-stone-200/80">
        {isBorrowed && loan ? (
          /* LOAN BOX: Quem pegou, Turma e Quando pegou */
          <div
            className={`rounded-lg p-3 ${
              dueStatus?.isOverdue
                ? 'bg-rose-100/60 border border-rose-200/80'
                : 'bg-amber-100/50 border border-amber-200/60'
            }`}
          >
            {/* Student Name & Class */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <User className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span className="text-xs font-bold text-stone-900 truncate">
                    {loan.studentName}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-white/80 px-2 py-0.5 rounded shadow-2xs shrink-0">
                  <GraduationCap className="w-3 h-3 text-stone-500" />
                  <span>{loan.studentClass}</span>
                </div>
              </div>

              {/* Borrow Date & Due Date */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60 text-[11px]">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">
                    Quando pegou:
                  </span>
                  <div className="flex items-center gap-1 text-stone-700 font-medium mt-0.5">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>{formatDateBR(loan.borrowedDate)}</span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    ({getBorrowedSinceLabel(loan.borrowedDate)})
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">
                    Devolver até:
                  </span>
                  <div
                    className={`font-semibold mt-0.5 flex items-center gap-1 ${
                      dueStatus?.isOverdue ? 'text-rose-700' : 'text-stone-800'
                    }`}
                  >
                    <span>{formatDateBR(loan.dueDate)}</span>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      dueStatus?.isOverdue ? 'text-rose-700 font-bold' : 'text-stone-600'
                    }`}
                  >
                    {dueStatus?.label}
                  </span>
                </div>
              </div>

              {loan.notes && (
                <p className="text-[11px] text-stone-600 italic line-clamp-1 pt-1 border-t border-stone-200/40">
                  "{loan.notes}"
                </p>
              )}

              {book.reservations && book.reservations.length > 0 && (
                <div className="pt-1.5 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                  <span>📌 Lista de espera:</span>
                  <span>{book.reservations.length} aluno(s) aguardando</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* AVAILABLE STATE: Livro na estante */
          <div className="space-y-1.5">
            <div className="rounded-lg p-2.5 bg-emerald-50/60 border border-emerald-200/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-900 block leading-tight">
                    Disponível na Estante
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Pronto para ser retirado
                  </span>
                </div>
              </div>
            </div>

            {book.reservations && book.reservations.length > 0 && (
              <div className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                ⭐ Há reserva para: <strong>{book.reservations[0].studentName}</strong> ({book.reservations[0].studentClass})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="p-3 bg-stone-50/80 border-t border-stone-200 flex items-center gap-2">
        {isBorrowed ? (
          <>
            <button
              onClick={() => onReturnBook(book)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-2xs transition-colors cursor-pointer"
              title="Registrar devolução do livro para a biblioteca"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Devolver</span>
            </button>

            <button
              onClick={() => onRenewLoan(book)}
              className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Renovar empréstimo por mais 7 dias"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">+7d</span>
            </button>

            <button
              onClick={() => onCopyReminderMessage(book)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Copiar lembrete para WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onViewDetails(book)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
              title="Ver detalhes do livro e histórico"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onOpenLoan(book)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-lg bg-amber-800 hover:bg-amber-900 text-white shadow-2xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Emprestar Livro</span>
            </button>

            <button
              onClick={() => onViewDetails(book)}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
            >
              Detalhes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

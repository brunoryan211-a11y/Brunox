import React from 'react';
import { Book } from '../types';
import { formatDateBR, getBorrowedSinceLabel, getDueStatus } from '../utils/dateUtils';
import { CheckCircle2, RotateCcw, BookOpen, Clock, MoreVertical, MessageCircle } from 'lucide-react';

interface BookTableProps {
  books: Book[];
  onOpenLoan: (book: Book) => void;
  onReturnBook: (book: Book) => void;
  onRenewLoan: (book: Book) => void;
  onViewDetails: (book: Book) => void;
  onCopyReminderMessage: (book: Book) => void;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  onOpenLoan,
  onReturnBook,
  onRenewLoan,
  onViewDetails,
  onCopyReminderMessage,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
            <tr>
              <th className="py-3 px-4 font-semibold">Código</th>
              <th className="py-3 px-4 font-semibold">Livro & Autor</th>
              <th className="py-3 px-4 font-semibold">Situação</th>
              <th className="py-3 px-4 font-semibold">Quem Pegou</th>
              <th className="py-3 px-4 font-semibold">Turma</th>
              <th className="py-3 px-4 font-semibold">Quando Pegou</th>
              <th className="py-3 px-4 font-semibold">Prazo Devolução</th>
              <th className="py-3 px-4 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {books.map((book) => {
              const isBorrowed = book.isBorrowed && !!book.currentLoan;
              const loan = book.currentLoan;
              const dueStatus = loan ? getDueStatus(loan.dueDate) : null;

              return (
                <tr
                  key={book.id}
                  className={`hover:bg-stone-50/70 transition-colors ${
                    isBorrowed && dueStatus?.isOverdue ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Código */}
                  <td className="py-3 px-4 font-mono font-medium text-stone-800">
                    {book.code}
                  </td>

                  {/* Livro & Autor */}
                  <td className="py-3 px-4 max-w-xs">
                    <button
                      onClick={() => onViewDetails(book)}
                      className="font-serif font-bold text-stone-900 hover:text-amber-900 transition-colors block text-sm text-left truncate cursor-pointer"
                    >
                      {book.title}
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                      <span>{book.author}</span>
                      <span>·</span>
                      <span className="truncate">{book.location}</span>
                    </div>
                  </td>

                  {/* Situação */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBorrowed ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          dueStatus?.isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100/80 text-amber-900 border border-amber-200/60'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {dueStatus?.isOverdue ? 'Atrasado' : 'Emprestado'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Na Biblioteca
                      </span>
                    )}
                  </td>

                  {/* Quem pegou */}
                  <td className="py-3 px-4">
                    {isBorrowed && loan ? (
                      <span className="font-semibold text-stone-900 block">
                        {loan.studentName}
                      </span>
                    ) : (
                      <span className="text-stone-400 italic">Disponível</span>
                    )}
                  </td>

                  {/* Turma */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBorrowed && loan ? (
                      <span className="inline-block bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded text-[11px]">
                        {loan.studentClass}
                      </span>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>

                  {/* Quando pegou */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBorrowed && loan ? (
                      <div>
                        <span className="text-stone-800 font-medium">
                          {formatDateBR(loan.borrowedDate)}
                        </span>
                        <span className="block text-[10px] text-stone-500">
                          {getBorrowedSinceLabel(loan.borrowedDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>

                  {/* Prazo */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isBorrowed && loan ? (
                      <div>
                        <span
                          className={`font-semibold ${
                            dueStatus?.isOverdue ? 'text-rose-700' : 'text-stone-800'
                          }`}
                        >
                          {formatDateBR(loan.dueDate)}
                        </span>
                        <span
                          className={`block text-[10px] font-medium ${
                            dueStatus?.isOverdue ? 'text-rose-700' : 'text-stone-500'
                          }`}
                        >
                          {dueStatus?.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {isBorrowed ? (
                        <>
                          <button
                            onClick={() => onReturnBook(book)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-colors"
                            title="Registrar devolução à biblioteca"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Devolver</span>
                          </button>
                          <button
                            onClick={() => onRenewLoan(book)}
                            className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                            title="Renovar por +7 dias"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onCopyReminderMessage(book)}
                            className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                            title="Copiar lembrete WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onOpenLoan(book)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-amber-800 hover:bg-amber-900 text-white cursor-pointer transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Emprestar</span>
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetails(book)}
                        className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                        title="Ver ficha completa do livro"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

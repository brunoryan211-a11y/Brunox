import { Book } from '../types';
import { formatDateBR, getBorrowedSinceLabel, getDueStatus } from '../utils/dateUtils';
import { GraduationCap, User, Calendar, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface ClassGroupViewProps {
  books: Book[];
  onReturnBook: (book: Book) => void;
  onRenewLoan: (book: Book) => void;
  onViewDetails: (book: Book) => void;
}

export const ClassGroupView: React.FC<ClassGroupViewProps> = ({
  books,
  onReturnBook,
  onRenewLoan,
  onViewDetails,
}) => {
  // Filter only borrowed books with valid loans
  const borrowedBooks = books.filter((b) => b.isBorrowed && b.currentLoan);

  // Group by studentClass
  const classMap = new Map<string, Book[]>();

  borrowedBooks.forEach((book) => {
    const cls = book.currentLoan?.studentClass || 'Sem Turma Definida';
    if (!classMap.has(cls)) {
      classMap.set(cls, []);
    }
    classMap.get(cls)!.push(book);
  });

  // Sort classes alphabetically
  const sortedClasses = Array.from(classMap.keys()).sort((a, b) => a.localeCompare(b));

  if (borrowedBooks.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-12 text-center my-6">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-900 font-serif">
          Nenhum livro emprestado no momento!
        </h3>
        <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
          Todos os exemplares estão guardados na biblioteca.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      <div className="bg-amber-100/50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-800 shrink-0" />
          <span>
            Mostrando <strong>{borrowedBooks.length}</strong> empréstimos ativos organizados por turma escolar.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedClasses.map((className) => {
          const classBooks = classMap.get(className) || [];
          const hasOverdue = classBooks.some(
            (b) => b.currentLoan && getDueStatus(b.currentLoan.dueDate).isOverdue
          );

          return (
            <div
              key={className}
              className={`bg-white border rounded-xl overflow-hidden shadow-2xs ${
                hasOverdue ? 'border-rose-300' : 'border-stone-200'
              }`}
            >
              {/* Turma Header */}
              <div
                className={`px-4 py-3 border-b flex items-center justify-between ${
                  hasOverdue ? 'bg-rose-50/70 border-rose-200' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      hasOverdue
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">
                      Turma: {className}
                    </h3>
                    <span className="text-[11px] text-stone-500">
                      {classBooks.length} {classBooks.length === 1 ? 'livro emprestado' : 'livros emprestados'}
                    </span>
                  </div>
                </div>

                {hasOverdue && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Pendência de atraso
                  </span>
                )}
              </div>

              {/* List of books with this class */}
              <div className="divide-y divide-stone-100">
                {classBooks.map((book) => {
                  const loan = book.currentLoan!;
                  const due = getDueStatus(loan.dueDate);

                  return (
                    <div
                      key={book.id}
                      className="p-3.5 hover:bg-stone-50/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-mono text-[11px] font-semibold text-stone-600 bg-stone-100 px-1 rounded">
                              {book.code}
                            </span>
                            <button
                              onClick={() => onViewDetails(book)}
                              className="font-serif font-bold text-stone-900 hover:text-amber-800 text-sm text-left cursor-pointer"
                            >
                              {book.title}
                            </button>
                          </div>
                          <span className="text-xs text-stone-500 block mt-0.5">
                            Autor: {book.author}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                            due.isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {due.label}
                        </span>
                      </div>

                      {/* Student info & dates */}
                      <div className="mt-2.5 pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-800">
                          <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span className="font-medium truncate">{loan.studentName}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>
                            Pegou em {formatDateBR(loan.borrowedDate)} ({getBorrowedSinceLabel(loan.borrowedDate)})
                          </span>
                        </div>
                      </div>

                      {/* Row actions */}
                      <div className="mt-2.5 flex items-center justify-end gap-2">
                        <button
                          onClick={() => onRenewLoan(book)}
                          className="px-2 py-1 text-[11px] font-medium rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 cursor-pointer"
                          title="Renovar mais 7 dias"
                        >
                          <RotateCcw className="w-3 h-3 inline mr-1" />
                          Renovar +7d
                        </button>
                        <button
                          onClick={() => onReturnBook(book)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Devolver à Biblioteca
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

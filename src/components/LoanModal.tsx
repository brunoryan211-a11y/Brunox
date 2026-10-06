import React, { useState, useEffect } from 'react';
import { Book, CurrentLoan } from '../types';
import { getTodayDateString, addDaysToDate } from '../utils/dateUtils';
import { X, BookOpen, User, GraduationCap, Calendar, Clock, AlertCircle } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToLoan: Book | null;
  availableBooks: Book[];
  availableClasses: string[];
  onSubmitLoan: (bookId: string, loanData: Omit<CurrentLoan, 'id' | 'renewCount'>) => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  bookToLoan,
  availableBooks,
  availableClasses,
  onSubmitLoan,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [customClass, setCustomClass] = useState<string>('');
  const [borrowedDate, setBorrowedDate] = useState<string>(getTodayDateString());
  const [dueDate, setDueDate] = useState<string>(addDaysToDate(getTodayDateString(), 14));
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const today = getTodayDateString();
      setBorrowedDate(today);
      setDueDate(addDaysToDate(today, 14));
      setError('');
      setNotes('');
      setStudentName('');

      if (bookToLoan) {
        setSelectedBookId(bookToLoan.id);
      } else if (availableBooks.length > 0) {
        setSelectedBookId(availableBooks[0].id);
      }

      if (availableClasses.length > 0 && !studentClass) {
        setStudentClass(availableClasses[0]);
      }
    }
  }, [isOpen, bookToLoan, availableBooks]);

  if (!isOpen) return null;

  const currentSelectedBook = availableBooks.find((b) => b.id === selectedBookId) || bookToLoan;

  const handleQuickDays = (days: number) => {
    setDueDate(addDaysToDate(borrowedDate, days));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError('Por favor, selecione um livro disponível para o empréstimo.');
      return;
    }
    if (!studentName.trim()) {
      setError('Por favor, preencha o nome do aluno ou leitor.');
      return;
    }

    const finalClass = studentClass === '__custom__' ? customClass.trim() : studentClass.trim();
    if (!finalClass) {
      setError('Por favor, informe a turma do aluno.');
      return;
    }

    if (!borrowedDate || !dueDate) {
      setError('Por favor, defina a data do empréstimo e o prazo de devolução.');
      return;
    }

    onSubmitLoan(selectedBookId, {
      studentName: studentName.trim(),
      studentClass: finalClass,
      borrowedDate,
      dueDate,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">Novo Empréstimo de Livro</h2>
              <p className="text-xs text-stone-300">
                Registre quem está retirando o livro da biblioteca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Book Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Livro a Emprestar *
            </label>
            {bookToLoan ? (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3">
                <div
                  className="w-3 h-10 rounded-xs shrink-0"
                  style={{ backgroundColor: bookToLoan.coverColor || '#78350f' }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-stone-700 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      {bookToLoan.code}
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-sm truncate">
                      {bookToLoan.title}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 truncate mt-0.5">
                    {bookToLoan.author} · {bookToLoan.location}
                  </p>
                </div>
              </div>
            ) : (
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              >
                {availableBooks.length === 0 ? (
                  <option value="">Nenhum livro disponível no momento</option>
                ) : (
                  availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.code}] {b.title} — {b.author}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Nome do Aluno / Leitor *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: Beatriz Lima, Lucas Silva..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800"
              />
            </div>
          </div>

          {/* Turma / Série */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Turma / Série *
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 cursor-pointer"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
                <option value="__custom__">+ Outra Turma (Digitar nova)...</option>
              </select>
            </div>

            {studentClass === '__custom__' && (
              <input
                type="text"
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                placeholder="Digite o nome da nova turma (ex: 5º Ano C)"
                className="mt-2 w-full px-3 py-2 text-xs bg-stone-50 border border-amber-300 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              />
            )}
          </div>

          {/* Dates: Borrowed & Due */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Data do Empréstimo
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={borrowedDate}
                  onChange={(e) => setBorrowedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Prazo de Devolução
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
                />
              </div>
            </div>
          </div>

          {/* Quick Due Date shortcuts */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 text-[11px]">Atalhos de prazo:</span>
            <button
              type="button"
              onClick={() => handleQuickDays(7)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              7 dias
            </button>
            <button
              type="button"
              onClick={() => handleQuickDays(14)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              14 dias (padrão)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDays(21)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              21 dias
            </button>
            <button
              type="button"
              onClick={() => handleQuickDays(30)}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
            >
              30 dias
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Leitura para trabalho de português, conservação com capa plástica..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 active:bg-amber-950 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Confirmar Empréstimo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

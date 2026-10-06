import React from 'react';
import { BookMarked, Library, Clock, AlertTriangle, ArrowDown } from 'lucide-react';
import { Book, ActiveTab } from '../types';
import { isLoanOverdue } from '../utils/dateUtils';

interface StatsBarProps {
  books: Book[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  books,
  activeTab,
  setActiveTab,
}) => {
  const total = books.length;
  const available = books.filter((b) => !b.isBorrowed).length;
  const borrowed = books.filter((b) => b.isBorrowed).length;
  const overdue = books.filter(
    (b) => b.isBorrowed && b.currentLoan && isLoanOverdue(b.currentLoan.dueDate)
  ).length;

  const handleCardClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    const el = document.getElementById('livros-lista');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Botão Clicável: Total */}
      <button
        type="button"
        onClick={() => handleCardClick('all')}
        className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
          activeTab === 'all'
            ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-4 ring-stone-900/15 scale-[1.02]'
            : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs hover:shadow-xs hover:border-stone-400'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                activeTab === 'all' ? 'text-stone-300' : 'text-stone-500'
              }`}
            >
              Total no Acervo
            </span>
            <Library className={`w-4 h-4 ${activeTab === 'all' ? 'text-amber-400' : 'text-stone-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {total}
            </span>
            <span className={`text-xs ${activeTab === 'all' ? 'text-stone-300' : 'text-stone-500 font-medium'}`}>
              títulos
            </span>
          </div>
        </div>

        <div
          className={`mt-3 pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
            activeTab === 'all' ? 'border-stone-700 text-amber-300' : 'border-stone-100 text-stone-600'
          }`}
        >
          <span>{activeTab === 'all' ? '● Exibindo Todos' : '👉 Clique para ver todos'}</span>
          <ArrowDown className="w-3 h-3" />
        </div>
      </button>

      {/* Botão Clicável: Na Biblioteca (Disponíveis) */}
      <button
        type="button"
        onClick={() => handleCardClick('available')}
        className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
          activeTab === 'available'
            ? 'bg-emerald-900 text-white border-emerald-900 shadow-md ring-4 ring-emerald-900/15 scale-[1.02]'
            : 'bg-white hover:bg-emerald-50/50 border-stone-200 shadow-2xs hover:shadow-xs hover:border-emerald-400'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                activeTab === 'available' ? 'text-emerald-200' : 'text-emerald-700'
              }`}
            >
              Na Biblioteca
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                activeTab === 'available' ? 'text-white' : 'text-emerald-950'
              }`}
            >
              {available}
            </span>
            <span
              className={`text-xs font-semibold ${
                activeTab === 'available' ? 'text-emerald-200' : 'text-emerald-700'
              }`}
            >
              disponíveis
            </span>
          </div>
        </div>

        <div
          className={`mt-3 pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
            activeTab === 'available'
              ? 'border-emerald-800 text-emerald-200'
              : 'border-stone-100 text-emerald-800'
          }`}
        >
          <span>{activeTab === 'available' ? '● Exibindo Disponíveis' : '👉 Ver disponíveis na estante'}</span>
          <ArrowDown className="w-3 h-3" />
        </div>
      </button>

      {/* Botão Clicável: Emprestados (Ver Quem Pegou) */}
      <button
        type="button"
        onClick={() => handleCardClick('borrowed')}
        className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
          activeTab === 'borrowed'
            ? 'bg-amber-900 text-white border-amber-900 shadow-md ring-4 ring-amber-900/15 scale-[1.02]'
            : 'bg-white hover:bg-amber-50/50 border-stone-200 shadow-2xs hover:shadow-xs hover:border-amber-400'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                activeTab === 'borrowed' ? 'text-amber-200' : 'text-amber-800'
              }`}
            >
              Emprestados
            </span>
            <Clock className={`w-4 h-4 ${activeTab === 'borrowed' ? 'text-amber-300' : 'text-amber-600'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                activeTab === 'borrowed' ? 'text-white' : 'text-amber-950'
              }`}
            >
              {borrowed}
            </span>
            <span
              className={`text-xs font-semibold ${
                activeTab === 'borrowed' ? 'text-amber-200' : 'text-amber-700'
              }`}
            >
              com alunos
            </span>
          </div>
        </div>

        <div
          className={`mt-3 pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
            activeTab === 'borrowed'
              ? 'border-amber-800 text-amber-200'
              : 'border-stone-100 text-amber-900 font-extrabold'
          }`}
        >
          <span>{activeTab === 'borrowed' ? '● Exibindo Emprestados' : '👉 Clique e veja quem pegou'}</span>
          <ArrowDown className="w-3 h-3" />
        </div>
      </button>

      {/* Botão Clicável: Em Atraso (Ver Quem Está Atrasado) */}
      <button
        type="button"
        onClick={() => handleCardClick('overdue')}
        className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
          activeTab === 'overdue'
            ? 'bg-rose-900 text-white border-rose-900 shadow-md ring-4 ring-rose-900/15 scale-[1.02]'
            : overdue > 0
            ? 'bg-rose-50/90 hover:bg-rose-100 border-rose-200 shadow-2xs hover:shadow-xs hover:border-rose-400 ring-2 ring-rose-300/40'
            : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                activeTab === 'overdue'
                  ? 'text-rose-200'
                  : overdue > 0
                  ? 'text-rose-700 font-extrabold'
                  : 'text-stone-500'
              }`}
            >
              Em Atraso
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                activeTab === 'overdue'
                  ? 'text-rose-300'
                  : overdue > 0
                  ? 'text-rose-600 animate-bounce'
                  : 'text-stone-400'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                activeTab === 'overdue' ? 'text-white' : overdue > 0 ? 'text-rose-700' : 'text-stone-900'
              }`}
            >
              {overdue}
            </span>
            <span
              className={`text-xs font-semibold ${
                activeTab === 'overdue' ? 'text-rose-200' : overdue > 0 ? 'text-rose-600' : 'text-stone-500'
              }`}
            >
              {overdue === 1 ? 'pendente' : 'pendentes'}
            </span>
          </div>
        </div>

        <div
          className={`mt-3 pt-2 border-t text-[11px] font-bold flex items-center justify-between ${
            activeTab === 'overdue'
              ? 'border-rose-800 text-rose-200'
              : overdue > 0
              ? 'border-rose-200 text-rose-800 font-extrabold'
              : 'border-stone-100 text-stone-500'
          }`}
        >
          <span>
            {activeTab === 'overdue'
              ? '● Exibindo Atrasados'
              : overdue > 0
              ? '👉 Clique e veja quem tá atrasado'
              : 'Tudo em dia'}
          </span>
          <ArrowDown className="w-3 h-3" />
        </div>
      </button>
    </div>
  );
};

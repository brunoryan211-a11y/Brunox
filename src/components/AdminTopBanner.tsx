import React from 'react';
import {
  BookOpen,
  ScanBarcode,
  Plus,
  Bell,
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Library,
  ArrowDown,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface AdminTopBannerProps {
  onOpenNewLoan: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenNewBook: () => void;
  onOpenNotifications: () => void;
  onLogoutAdmin: () => void;
  availableCount: number;
  borrowedCount: number;
  overdueCount: number;
  totalCount: number;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AdminTopBanner: React.FC<AdminTopBannerProps> = ({
  onOpenNewLoan,
  onOpenBarcodeScanner,
  onOpenNewBook,
  onOpenNotifications,
  onLogoutAdmin,
  availableCount,
  borrowedCount,
  overdueCount,
  totalCount,
  activeTab,
  setActiveTab,
}) => {
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    // Smooth scroll to books list section
    const el = document.getElementById('livros-lista');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-7 shadow-xl border border-stone-800 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: session info & loan button */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sessão Administrativa Ativa
            </span>
            <span className="text-stone-400 text-xs">· BibliotecaErem2025</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            Gestão de Livros & Empréstimos
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Selecione uma das categorias abaixo para filtrar e ver quem está com cada livro:
          </p>
        </div>

        {/* Top-level Loan and Management Actions */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Huge High-Visibility Loan Button */}
          <button
            onClick={onOpenNewLoan}
            className="group relative flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:from-amber-700 active:to-amber-800 text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-4 ring-amber-500/20"
            title="Registrar empréstimo de um livro para aluno ou professor"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block leading-tight uppercase tracking-wider text-xs sm:text-sm">
                + Realizar Empréstimo
              </span>
              <span className="block text-[11px] font-medium text-amber-100/90 leading-tight">
                Emprestar livro para aluno agora
              </span>
            </div>
          </button>

          {/* Quick Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBarcodeScanner}
              title="Escanear código de barras ou ISBN do livro"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <ScanBarcode className="w-4 h-4 text-amber-400" />
              <span>Escanear Código</span>
            </button>

            <button
              onClick={onOpenNewBook}
              title="Cadastrar novo livro no acervo"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Novo Livro</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              title="Encerrar sessão de administrador e voltar para leitores"
              className="p-3 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-stone-300 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CLIKABLE CATEGORY BUTTONS: Disponíveis, Emprestados, Em Atraso, etc. */}
      <div className="mt-6 pt-5 border-t border-stone-800/80">
        <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider block mb-2.5">
          Filtrar e Ver Quem Está com Cada Livro:
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* BOTÃO CLICÁVEL: EMPRESTADOS (Ver Quem Pegou) */}
          <button
            type="button"
            onClick={() => handleSelectTab('borrowed')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'borrowed'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-lg ring-2 ring-amber-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/15 border-white/10 text-white hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'borrowed' ? 'text-stone-950' : 'text-amber-300'}`}>
                Emprestados
              </span>
              <Clock className={`w-4 h-4 ${activeTab === 'borrowed' ? 'text-stone-950' : 'text-amber-400'}`} />
            </div>

            <div className="my-1.5">
              <span className="text-2xl font-extrabold leading-tight">
                {borrowedCount}
              </span>
              <span className="text-xs ml-1 font-semibold opacity-90">livros</span>
            </div>

            <div className={`text-[11px] font-bold flex items-center gap-1 ${activeTab === 'borrowed' ? 'text-stone-900 underline' : 'text-amber-200'}`}>
              <span>👉 Ver quem pegou</span>
              <ArrowDown className="w-3 h-3" />
            </div>
          </button>

          {/* BOTÃO CLICÁVEL: EM ATRASO (Ver Quem Tá Atrasado) */}
          <button
            type="button"
            onClick={() => handleSelectTab('overdue')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white border-rose-400 shadow-lg ring-2 ring-rose-300 scale-[1.02]'
                : overdueCount > 0
                ? 'bg-rose-950/60 hover:bg-rose-900/70 border-rose-500/40 text-rose-200 hover:border-rose-400'
                : 'bg-white/10 hover:bg-white/15 border-white/10 text-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'overdue' ? 'text-white' : overdueCount > 0 ? 'text-rose-300' : 'text-stone-400'}`}>
                Em Atraso
              </span>
              <AlertTriangle className={`w-4 h-4 ${activeTab === 'overdue' ? 'text-white' : overdueCount > 0 ? 'text-rose-400 animate-bounce' : 'text-stone-400'}`} />
            </div>

            <div className="my-1.5">
              <span className="text-2xl font-extrabold leading-tight">
                {overdueCount}
              </span>
              <span className="text-xs ml-1 font-semibold opacity-90">pendentes</span>
            </div>

            <div className={`text-[11px] font-bold flex items-center gap-1 ${activeTab === 'overdue' ? 'text-white underline' : overdueCount > 0 ? 'text-rose-300' : 'text-stone-400'}`}>
              <span>👉 Ver quem tá atrasado</span>
              <ArrowDown className="w-3 h-3" />
            </div>
          </button>

          {/* BOTÃO CLICÁVEL: DISPONÍVEIS (Na Estante) */}
          <button
            type="button"
            onClick={() => handleSelectTab('available')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg ring-2 ring-emerald-300 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/15 border-white/10 text-white hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'available' ? 'text-white' : 'text-emerald-300'}`}>
                Na Biblioteca
              </span>
              <CheckCircle2 className={`w-4 h-4 ${activeTab === 'available' ? 'text-white' : 'text-emerald-400'}`} />
            </div>

            <div className="my-1.5">
              <span className="text-2xl font-extrabold leading-tight">
                {availableCount}
              </span>
              <span className="text-xs ml-1 font-semibold opacity-90">disponíveis</span>
            </div>

            <div className={`text-[11px] font-bold flex items-center gap-1 ${activeTab === 'available' ? 'text-white underline' : 'text-emerald-200'}`}>
              <span>👉 Ver na estante</span>
              <ArrowDown className="w-3 h-3" />
            </div>
          </button>

          {/* BOTÃO CLICÁVEL: TODOS OS LIVROS */}
          <button
            type="button"
            onClick={() => handleSelectTab('all')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'all'
                ? 'bg-stone-800 text-white border-stone-500 shadow-lg ring-2 ring-stone-400 scale-[1.02]'
                : 'bg-white/10 hover:bg-white/15 border-white/10 text-white hover:border-stone-400/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-white' : 'text-stone-300'}`}>
                Todo o Acervo
              </span>
              <Library className={`w-4 h-4 ${activeTab === 'all' ? 'text-amber-400' : 'text-stone-400'}`} />
            </div>

            <div className="my-1.5">
              <span className="text-2xl font-extrabold leading-tight">
                {totalCount}
              </span>
              <span className="text-xs ml-1 font-semibold opacity-90">títulos</span>
            </div>

            <div className={`text-[11px] font-bold flex items-center gap-1 ${activeTab === 'all' ? 'text-white underline' : 'text-stone-300'}`}>
              <span>👉 Ver acervo completo</span>
              <ArrowDown className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

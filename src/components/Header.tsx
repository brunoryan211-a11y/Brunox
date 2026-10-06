import React from 'react';
import {
  BookOpen,
  Plus,
  Download,
  History,
  Users,
  ScanBarcode,
  Bell,
  ShieldCheck,
  Compass,
  LogOut,
  Lock,
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAdminAuthenticated: boolean;
  onRequestAdminAccess: () => void;
  onLogoutAdmin: () => void;
  onOpenNewLoan: () => void;
  onOpenNewBook: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenNotifications: () => void;
  onExportCSV: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  overdueCount: number;
  pendingNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  isAdminAuthenticated,
  onRequestAdminAccess,
  onLogoutAdmin,
  onOpenNewLoan,
  onOpenNewBook,
  onOpenBarcodeScanner,
  onOpenNotifications,
  onExportCSV,
  activeTab,
  setActiveTab,
  overdueCount,
  pendingNotificationsCount,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                  Biblioteca Escolar
                </h1>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    userRole === 'admin'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {userRole === 'admin' ? 'Painel do Administrador' : 'Biblioteca Digital'}
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                {userRole === 'admin'
                  ? 'Controle de acervo, quem pegou, turmas e devoluções'
                  : 'Catálogo de livros, recomendações e disponibilidade'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Role Switcher Pill */}
            <div className="bg-stone-100 p-1 rounded-xl border border-stone-200 flex items-center gap-1">
              <button
                onClick={() => setUserRole('reader')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'reader'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Visualização para Alunos e Leitores"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span>Leitores</span>
              </button>

              <button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setUserRole('admin');
                  } else {
                    onRequestAdminAccess();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'admin'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Acesso com login e senha da administração"
              >
                {isAdminAuthenticated ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>Administração</span>
              </button>
            </div>

            {/* Admin-only fast action tools */}
            {userRole === 'admin' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Notification Bell with Badge */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  title="Central de Lembretes & Notificações de Devolução"
                >
                  <Bell className="w-5 h-5" />
                  {pendingNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                      {pendingNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Barcode Scanner Button */}
                <button
                  onClick={onOpenBarcodeScanner}
                  title="Escanear código de barras ou ISBN do livro"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  <ScanBarcode className="w-4 h-4 text-amber-800" />
                  <span className="hidden md:inline">Escanear</span>
                </button>

                <button
                  onClick={onExportCSV}
                  title="Baixar planilha CSV para Excel"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/70 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>

                {/* HIGH VISIBILITY TOP LOAN BUTTON */}
                <button
                  onClick={onOpenNewLoan}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-amber-800 hover:bg-amber-900 active:bg-amber-950 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-amber-800/20"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>+ Emprestar Livro</span>
                </button>

                <button
                  onClick={onLogoutAdmin}
                  title="Encerrar sessão de administrador"
                  className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenBarcodeScanner}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ScanBarcode className="w-4 h-4 text-amber-800" />
                  <span className="hidden sm:inline">Consultar por Código</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Shown when in Admin Mode */}
        {userRole === 'admin' && (
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 border-t border-stone-100 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Todos os Livros
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'available'
                  ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Na Biblioteca (Disponíveis)
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'borrowed'
                  ? 'bg-amber-800 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Emprestados no Momento
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'overdue'
                  ? 'bg-rose-700 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Em Atraso ({overdueCount})
            </button>
            <button
              onClick={() => setActiveTab('by-class')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'by-class'
                  ? 'bg-indigo-800 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Por Turma</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-stone-800 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico de Devoluções</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

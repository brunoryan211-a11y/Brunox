import React, { useState } from 'react';
import { Book, DueNotification } from '../types';
import { formatDateBR } from '../utils/dateUtils';
import {
  buildReaderNotificationText,
  sendBrowserNotification,
  requestNotificationPermission,
} from '../utils/notificationUtils';
import {
  X,
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  RotateCcw,
  MessageCircle,
  Copy,
  Check,
  Send,
  SendHorizontal,
  Volume2,
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DueNotification[];
  books: Book[];
  onReturnBook: (book: Book) => void;
  onRenewLoan: (book: Book) => void;
  onViewDetails: (book: Book) => void;
  onNotifyWhatsApp: (notification: DueNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  books,
  onReturnBook,
  onRenewLoan,
  onViewDetails,
  onNotifyWhatsApp,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'due_today' | 'due_soon'>('all');
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [browserNotifStatus, setBrowserNotifStatus] = useState<string>('');

  if (!isOpen) return null;

  const overdueList = notifications.filter((n) => n.type === 'overdue');
  const todayList = notifications.filter((n) => n.type === 'due_today');
  const soonList = notifications.filter((n) => n.type === 'due_soon');

  const filtered = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleCopyBatchReport = () => {
    if (notifications.length === 0) return;

    let text = `📋 *RELATÓRIO DE DEVOLUÇÕES & LEMBRETES - BIBLIOTECA ESCOLAR*\n\n`;

    if (overdueList.length > 0) {
      text += `🚨 *LIVROS EM ATRASO:*\n`;
      overdueList.forEach((n, i) => {
        text += `${i + 1}. *${n.bookTitle}* (${n.bookCode})\n   Leitor: ${n.readerName} - Turma: ${n.readerClass}\n   Venceu em: ${formatDateBR(n.dueDate)} (Atrasado há ${Math.abs(n.daysDifference)} dias)\n\n`;
      });
    }

    if (todayList.length > 0) {
      text += `⏰ *VENCENDO HOJE:*\n`;
      todayList.forEach((n, i) => {
        text += `${i + 1}. *${n.bookTitle}* (${n.bookCode})\n   Leitor: ${n.readerName} - Turma: ${n.readerClass}\n   Devolver até hoje: ${formatDateBR(n.dueDate)}\n\n`;
      });
    }

    if (soonList.length > 0) {
      text += `📅 *PRÓXIMOS DA DEVOLUÇÃO (1 a 3 dias):*\n`;
      soonList.forEach((n, i) => {
        text += `${i + 1}. *${n.bookTitle}* (${n.bookCode})\n   Leitor: ${n.readerName} - Turma: ${n.readerClass}\n   Prazo: ${formatDateBR(n.dueDate)} (faltam ${n.daysDifference} dias)\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2500);
  };

  const handleTriggerBrowserNotification = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      if (overdueList.length > 0) {
        sendBrowserNotification(
          `Biblioteca: ${overdueList.length} livro(s) em atraso!`,
          `Exemplo: "${overdueList[0].bookTitle}" com ${overdueList[0].readerName} (${overdueList[0].readerClass}) venceu em ${formatDateBR(overdueList[0].dueDate)}.`
        );
      } else if (todayList.length > 0) {
        sendBrowserNotification(
          `Biblioteca: ${todayList.length} livro(s) vencem hoje!`,
          `"${todayList[0].bookTitle}" com ${todayList[0].readerName} vence hoje (${formatDateBR(todayList[0].dueDate)}).`
        );
      } else {
        sendBrowserNotification(
          'Biblioteca Escolar',
          'Todos os empréstimos estão em dia! Nenhum livro em atraso no momento.'
        );
      }
      setBrowserNotifStatus('Notificação do sistema enviada com sucesso!');
      setTimeout(() => setBrowserNotifStatus(''), 3000);
    } else {
      setBrowserNotifStatus('Permissão de notificações bloqueada no navegador.');
      setTimeout(() => setBrowserNotifStatus(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif">
                  Central de Notificações & Lembretes
                </h2>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                  {notifications.length} pendências
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Alertas automáticos para leitores e administradores sobre prazos de devolução
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

        {/* Global Action Bar */}
        <div className="bg-stone-50 p-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'overdue'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Atrasados ({overdueList.length})</span>
            </button>
            <button
              onClick={() => setFilterType('due_today')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'due_today'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Vencem Hoje ({todayList.length})</span>
            </button>
            <button
              onClick={() => setFilterType('due_soon')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'due_soon'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Próximos ({soonList.length})</span>
            </button>
          </div>

          {/* Batch Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerBrowserNotification}
              title="Disparar notificação na área de trabalho do navegador"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Alertar Navegador</span>
            </button>

            <button
              onClick={handleCopyBatchReport}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer shadow-2xs"
            >
              {copiedBatch ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Todos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {browserNotifStatus && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs border-b border-emerald-200">
            {browserNotifStatus}
          </div>
        )}

        {/* Notifications List */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-stone-900 text-base">Nenhum lembrete nesta categoria!</h4>
              <p className="text-xs text-stone-500 mt-1">
                Todos os exemplares estão dentro do prazo estipulado.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const book = books.find((b) => b.id === item.bookId);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.type === 'overdue'
                      ? 'bg-rose-50/50 border-rose-200'
                      : item.type === 'due_today'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  {/* Top line: Type badge & Due Date */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                        item.type === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : item.type === 'due_today'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.type === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                      {item.type === 'due_today' && <Clock className="w-3 h-3" />}
                      {item.type === 'due_soon' && <Calendar className="w-3 h-3" />}
                      <span>
                        {item.type === 'overdue'
                          ? `Atrasado há ${Math.abs(item.daysDifference)} dias`
                          : item.type === 'due_today'
                          ? 'Devolução Vence Hoje!'
                          : `Vence em ${item.daysDifference} dias`}
                      </span>
                    </span>

                    <span className="text-xs font-semibold text-stone-700">
                      Prazo: <strong>{formatDateBR(item.dueDate)}</strong>
                    </span>
                  </div>

                  {/* Book & Reader info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        {item.bookCode}
                      </span>
                      <h4
                        onClick={() => book && onViewDetails(book)}
                        className="font-serif font-bold text-stone-900 text-sm hover:text-amber-900 cursor-pointer transition-colors"
                      >
                        {item.bookTitle}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 pt-0.5">
                      <span>
                        Leitor: <strong className="text-stone-900">{item.readerName}</strong>
                      </span>
                      <span>·</span>
                      <span className="bg-white/80 px-1.5 py-0.5 rounded text-stone-700 font-medium">
                        Turma: {item.readerClass}
                      </span>
                      <span>·</span>
                      <span className="text-stone-500 text-[11px]">
                        Retirado em {formatDateBR(item.borrowedDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this individual reminder */}
                  <div className="mt-3.5 pt-2.5 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => onNotifyWhatsApp(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Notificar Leitor (WhatsApp)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {book && (
                        <>
                          <button
                            onClick={() => onRenewLoan(book)}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 cursor-pointer"
                            title="Renovar por +7 dias"
                          >
                            <RotateCcw className="w-3 h-3 inline mr-1" />
                            <span>Renovar</span>
                          </button>
                          <button
                            onClick={() => onReturnBook(book)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-stone-900 hover:bg-stone-800 text-white cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            <span>Devolver</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>
            Notificações calculadas com base nas datas de retirada e devolução previstas.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

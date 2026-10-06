import React, { useState } from 'react';
import { Book } from '../types';
import { formatDateBR, getDueStatus } from '../utils/dateUtils';
import { X, MessageCircle, Copy, Check, Send } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, book }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !book || !book.currentLoan) return null;

  const loan = book.currentLoan;
  const status = getDueStatus(loan.dueDate);

  const defaultMessage = status.isOverdue
    ? `Olá, ${loan.studentName} (${loan.studentClass})!\n\nAviso da Biblioteca Escolar: O prazo de devolução do livro "${book.title}" (Tombo: ${book.code}) venceu em ${formatDateBR(loan.dueDate)} (${status.label}).\n\nPor favor, compareça à biblioteca para realizar a devolução ou solicitar a renovação do empréstimo.\n\nObrigado(a)! 📚`
    : `Olá, ${loan.studentName} (${loan.studentClass})!\n\nLembrete da Biblioteca Escolar: O livro "${book.title}" (Tombo: ${book.code}) retirado em ${formatDateBR(loan.borrowedDate)} tem data de devolução prevista para ${formatDateBR(loan.dueDate)} (${status.label}).\n\nContamos com você para manter o prazo! 📚`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden my-8">
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">
                {status.isOverdue ? 'Cobrança de Livro em Atraso' : 'Lembrete de Devolução'}
              </h2>
              <p className="text-xs text-emerald-200">
                Enviar para {loan.studentName} ({loan.studentClass})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-xs text-stone-600">
            Você pode copiar este texto para enviar no grupo da turma, para o professor ou no WhatsApp dos responsáveis:
          </div>

          <textarea
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copiado para Área de Transferência!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-500" />
                  <span>Copiar Mensagem</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
              <span>Abrir no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

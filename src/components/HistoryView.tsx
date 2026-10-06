import React, { useState } from 'react';
import { LoanHistoryItem } from '../types';
import { formatDateBR } from '../utils/dateUtils';
import { History, Search, CheckCircle2, AlertTriangle, BookOpen, User, GraduationCap } from 'lucide-react';

interface HistoryViewProps {
  history: LoanHistoryItem[];
  onClearHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.bookTitle.toLowerCase().includes(term) ||
      item.bookCode.toLowerCase().includes(term) ||
      item.studentName.toLowerCase().includes(term) ||
      item.studentClass.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 my-6">
      {/* Top filter and header */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-800" />
            <span>Histórico de Devoluções</span>
          </h3>
          <p className="text-xs text-stone-500">
            Registro de todos os livros que já foram retirados e devolvidos à biblioteca
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar histórico..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500">
          <p className="text-sm">Nenhum registro de devolução encontrado.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Livro</th>
                  <th className="py-3 px-4 font-semibold">Aluno(a)</th>
                  <th className="py-3 px-4 font-semibold">Turma</th>
                  <th className="py-3 px-4 font-semibold">Retirada</th>
                  <th className="py-3 px-4 font-semibold">Devolução</th>
                  <th className="py-3 px-4 font-semibold">Condição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Livro */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-stone-600 bg-stone-100 px-1 rounded">
                          {item.bookCode}
                        </span>
                        <span className="font-bold text-stone-900">{item.bookTitle}</span>
                      </div>
                    </td>

                    {/* Aluno */}
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {item.studentName}
                    </td>

                    {/* Turma */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {item.studentClass}
                      </span>
                    </td>

                    {/* Retirada */}
                    <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                      {formatDateBR(item.borrowedDate)}
                    </td>

                    {/* Devolução */}
                    <td className="py-3 px-4 whitespace-nowrap text-stone-900 font-medium">
                      {formatDateBR(item.returnedDate)}
                    </td>

                    {/* Condição */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.wasLate
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.wasLate ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Com atraso</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>No prazo</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Book, BookReservation } from '../types';
import { formatDateBR } from '../utils/dateUtils';
import {
  X,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Bookmark,
  Sparkles,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ReaderBookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  allBooks: Book[];
  onSelectRecommendedBook: (book: Book) => void;
  onRequestReservation: (bookId: string, reservation: Omit<BookReservation, 'id' | 'requestDate'>) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (bookId: string) => void;
  availableClasses: string[];
}

export const ReaderBookDetailModal: React.FC<ReaderBookDetailModalProps> = ({
  isOpen,
  onClose,
  book,
  allBooks,
  onSelectRecommendedBook,
  onRequestReservation,
  isFavorited = false,
  onToggleFavorite,
  availableClasses,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState(availableClasses[0] || '7º Ano A');
  const [reservationSent, setReservationSent] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !book) return null;

  const isAvailable = !book.isBorrowed;
  const dueDate = book.currentLoan?.dueDate ? formatDateBR(book.currentLoan.dueDate) : null;

  // Recommendations: books with the same genre or author, excluding current
  const recommendations = allBooks
    .filter(
      (b) =>
        b.id !== book.id &&
        (b.genre === book.genre || b.author === book.author || b.isFeatured)
    )
    .slice(0, 3);

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    onRequestReservation(book.id, {
      bookId: book.id,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
    });
    setReservationSent(true);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-8">
        {/* Top visual book banner */}
        <div
          className="p-6 sm:p-8 text-white relative overflow-hidden"
          style={{ backgroundColor: book.coverColor || '#1e3a5f' }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-black/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
            {/* Book cover icon */}
            <div className="w-20 h-28 rounded-xl bg-black/25 border-2 border-white/20 p-2 flex flex-col justify-between shrink-0 shadow-lg">
              <span className="font-mono text-[9px] text-white/70 tracking-widest">{book.code}</span>
              <BookOpen className="w-8 h-8 text-white/90 mx-auto" />
              <div className="w-full h-1 bg-white/40 rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-white/80">
                <span className="bg-black/30 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {book.genre}
                </span>
                {book.pages && <span>· {book.pages} páginas</span>}
                {book.isbn && <span>· ISBN {book.isbn}</span>}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight leading-snug">
                {book.title}
              </h2>
              <p className="text-sm text-white/90 font-medium mt-1">Por {book.author}</p>

              {/* Rating and Favorite */}
              <div className="flex items-center gap-3 mt-3">
                {book.rating && (
                  <div className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{book.rating.toFixed(1)} / 5.0</span>
                  </div>
                )}

                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(book.id)}
                    className="inline-flex items-center gap-1.5 bg-black/30 hover:bg-black/40 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white text-white' : ''}`} />
                    <span>{isFavorited ? 'Salvo nos Favoritos' : 'Favoritar Livro'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Availability Status Card */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isAvailable
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {isAvailable ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                  <Clock className="w-5 h-5" />
                </div>
              )}

              <div>
                <h4 className="font-bold text-sm">
                  {isAvailable
                    ? 'Disponível na Biblioteca para Retirada!'
                    : 'Atualmente Emprestado com Outro Leitor'}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isAvailable ? (
                    <>
                      Localização física: <strong>{book.location}</strong>. Vá até a biblioteca e
                      informe o Tombo <strong>{book.code}</strong>.
                    </>
                  ) : (
                    <>
                      Previsão de retorno para a estante em <strong>{dueDate || 'breve'}</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Book Synopsis / Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Sobre Esta Obra
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed font-serif bg-stone-50 p-4 rounded-xl border border-stone-100">
              {book.notes ||
                `"${book.title}" é uma importante obra de ${book.author}, classificada no gênero ${book.genre}. Excelente escolha de leitura para enriquecer seu repertório cultural e acadêmico.`}
            </p>
          </div>

          {/* Book Reservation Form (if borrowed) */}
          {!isAvailable && (
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                <span>Quero Ler Este Livro (Lista de Espera)</span>
              </h4>
              <p className="text-xs text-stone-500 mb-3">
                Deixe seu nome para que a biblioteca reserve este exemplar para você assim que ele
                for devolvido.
              </p>

              {reservationSent ? (
                <div className="p-3 bg-emerald-100/70 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Reserva confirmada! Avisaremos você assim que o exemplar retornar à biblioteca.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleReserve} className="space-y-3">
                  {error && (
                    <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Seu nome completo..."
                      className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
                    />

                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30 cursor-pointer"
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 text-xs font-bold rounded-lg bg-amber-800 hover:bg-amber-900 text-white cursor-pointer transition-colors shadow-2xs"
                  >
                    Entrar na Lista de Espera Deste Livro
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Recommendations: "Você também pode gostar de..." */}
          {recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Você Também Pode Gostar De:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      onSelectRecommendedBook(rec);
                    }}
                    className="p-3 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/20 text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-stone-400 block uppercase">
                        {rec.genre}
                      </span>
                      <h5 className="font-serif font-bold text-xs text-stone-900 line-clamp-1 group-hover:text-amber-900 mt-0.5">
                        {rec.title}
                      </h5>
                      <span className="text-[11px] text-stone-500 block truncate">
                        {rec.author}
                      </span>
                    </div>

                    <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between text-[10px]">
                      <span
                        className={`font-semibold ${
                          !rec.isBorrowed ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {!rec.isBorrowed ? '🟢 Disponível' : '🟠 Emprestado'}
                      </span>
                      <span className="text-amber-900 font-bold group-hover:underline">Ver →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Código Tombo: <strong className="font-mono text-stone-800">{book.code}</strong>
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

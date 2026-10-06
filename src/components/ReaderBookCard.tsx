import React from 'react';
import { Book } from '../types';
import { formatDateBR } from '../utils/dateUtils';
import { MapPin, Star, Bookmark, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface ReaderBookCardProps {
  book: Book;
  onSelectBook: (book: Book) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (bookId: string) => void;
}

export const ReaderBookCard: React.FC<ReaderBookCardProps> = ({
  book,
  onSelectBook,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const isAvailable = !book.isBorrowed;
  const dueDate = book.currentLoan?.dueDate ? formatDateBR(book.currentLoan.dueDate) : null;

  return (
    <div
      onClick={() => onSelectBook(book)}
      className="group relative bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Book Cover simulation & Header */}
      <div className="p-4 pb-3">
        {/* Top badges: availability & bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Disponível</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-900 border border-amber-200/60">
              <Clock className="w-3 h-3 text-amber-700" />
              <span>Emprestado</span>
            </span>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(book.id);
              }}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isFavorited
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title={isFavorited ? 'Remover dos favoritos' : 'Salvar na lista de desejos'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Book Visual Presentation */}
        <div className="flex items-start gap-3">
          {/* Simulated Hardcover Book Spine */}
          <div
            className="w-12 h-20 rounded-md shrink-0 shadow-sm border border-black/15 flex flex-col justify-between p-1 relative overflow-hidden group-hover:scale-105 transition-transform"
            style={{ backgroundColor: book.coverColor || '#1e3a5f' }}
          >
            <div className="w-full h-0.5 bg-white/30 rounded-full" />
            <span className="text-[7px] text-white/90 font-mono tracking-tighter truncate text-center block">
              {book.code}
            </span>
            <div className="w-full h-0.5 bg-white/30 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-900 transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-stone-600 font-medium truncate mt-0.5">
              {book.author}
            </p>

            {/* Rating & Pages */}
            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1.5">
              {book.rating && (
                <div className="flex items-center gap-0.5 font-bold text-amber-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{book.rating.toFixed(1)}</span>
                </div>
              )}
              {book.pages && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{book.pages} págs</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Genre and synopsis snippet */}
        <div className="mt-3 text-xs text-stone-500">
          <span className="font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
            {book.genre}
          </span>
          {book.notes && (
            <p className="mt-2 text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
              {book.notes}
            </p>
          )}
        </div>
      </div>

      {/* Footer Availability Details */}
      <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
        {isAvailable ? (
          <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{book.location}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-900 text-[11px] truncate">
            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">Previsão: {dueDate || 'Em breve'}</span>
          </div>
        )}

        <span className="text-[11px] font-bold text-amber-900 group-hover:underline shrink-0">
          Ver detalhes →
        </span>
      </div>
    </div>
  );
};

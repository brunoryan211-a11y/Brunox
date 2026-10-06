import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { ReaderBookCard } from './ReaderBookCard';
import {
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Bookmark,
  Compass,
  ArrowRight,
  Filter,
  X,
} from 'lucide-react';

interface ReaderPortalProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  favorites: string[];
  onToggleFavorite: (bookId: string) => void;
  onSwitchToAdmin: () => void;
}

export const ReaderPortal: React.FC<ReaderPortalProps> = ({
  books,
  onSelectBook,
  favorites,
  onToggleFavorite,
  onSwitchToAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'all' | 'featured' | 'favorites'>('all');

  // Available unique genres
  const genres = useMemo(() => {
    const list = Array.from(new Set(books.map((b) => b.genre))).filter(Boolean);
    return list.sort();
  }, [books]);

  // Featured books (recommendations)
  const featuredBooks = useMemo(() => {
    return books.filter((b) => b.isFeatured || (b.rating && b.rating >= 4.8));
  }, [books]);

  // Currently available books
  const availableBooks = useMemo(() => {
    return books.filter((b) => !b.isBorrowed);
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (activeSection === 'featured') {
      result = result.filter((b) => b.isFeatured || (b.rating && b.rating >= 4.8));
    } else if (activeSection === 'favorites') {
      result = result.filter((b) => favorites.includes(b.id));
    }

    if (onlyAvailable) {
      result = result.filter((b) => !b.isBorrowed);
    }

    if (selectedGenre !== 'all') {
      result = result.filter((b) => b.genre === selectedGenre);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q) ||
          (b.notes && b.notes.toLowerCase().includes(q))
      );
    }

    return result;
  }, [books, activeSection, onlyAvailable, selectedGenre, searchQuery, favorites]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <section className="relative rounded-3xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white p-6 sm:p-10 shadow-lg overflow-hidden">
        {/* Subtle decorative shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal do Leitor & Biblioteca Digital</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-white leading-tight">
            Descubra suas próximas leituras favoritas
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
            Consulte nosso acervo em tempo real: veja quais livros estão disponíveis na estante
            para retirar agora ou reserve os títulos que já estão com outros leitores.
          </p>

          {/* Big Search Bar */}
          <div className="mt-6 flex items-center bg-white rounded-2xl p-1.5 shadow-md">
            <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquise por título, autor, assunto ou gênero..."
              className="w-full px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Metrics - Clickable Filter Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setOnlyAvailable(!onlyAvailable);
                setActiveSection('all');
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                onlyAvailable
                  ? 'bg-emerald-500 text-stone-950 font-bold ring-2 ring-emerald-300'
                  : 'bg-white/15 hover:bg-white/25 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                <strong>{availableBooks.length}</strong> disponíveis para retirar
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection('featured');
                setOnlyAvailable(false);
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                activeSection === 'featured'
                  ? 'bg-amber-400 text-stone-950 font-bold ring-2 ring-amber-200'
                  : 'bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/30'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>
                <strong>{featuredBooks.length}</strong> recomendações especiais
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOnlyAvailable(false);
                setActiveSection('all');
              }}
              className="px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-medium bg-white/10 hover:bg-white/20 text-stone-300 border border-white/10"
            >
              <span>Ver acervo completo ({books.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Recommended Shelves (Recomendações da Semana) - shown when no custom filter active */}
      {!searchQuery && selectedGenre === 'all' && activeSection === 'all' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Recomendações da Biblioteca
                </h3>
                <p className="text-xs text-stone-500">
                  Leituras premiadas e favoritas escolhidas pela equipe para você
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('featured')}
              className="text-xs font-bold text-amber-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas as recomendações</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredBooks.slice(0, 4).map((book) => (
              <ReaderBookCard
                key={book.id}
                book={book}
                onSelectBook={onSelectBook}
                isFavorited={favorites.includes(book.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Catalog Explorer Section */}
      <section className="space-y-4">
        {/* Navigation Tabs & Filters */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category / Showcase Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSection === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Todo o Acervo ({books.length})
              </button>
              <button
                onClick={() => setActiveSection('featured')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'featured'
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Recomendações ({featuredBooks.length})</span>
              </button>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSection === 'favorites'
                    ? 'bg-amber-900 text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Minha Lista ({favorites.length})</span>
              </button>
            </div>

            {/* Availability Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-800 rounded focus:ring-amber-800 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Apenas disponíveis para retirada</span>
              </span>
            </label>
          </div>

          {/* Genre chips bar */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            <span className="text-stone-400 text-[11px] font-semibold mr-1">Gênero:</span>
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedGenre === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Todos
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedGenre === genre
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Results Grid */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-stone-800 text-lg">
              Nenhum livro encontrado para os filtros selecionados
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Tente buscar por outro termo ou desmarque o filtro de disponibilidade.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setOnlyAvailable(false);
                setActiveSection('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold bg-stone-900 text-white rounded-xl cursor-pointer"
            >
              Limpar todos os filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredBooks.map((book) => (
              <ReaderBookCard
                key={book.id}
                book={book}
                onSelectBook={onSelectBook}
                isFavorited={favorites.includes(book.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reader Guidance Footer */}
      <section className="bg-amber-100/40 border border-amber-200/70 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-base text-stone-900">
            Como funciona o empréstimo na biblioteca?
          </h4>
          <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
            Encontrou um livro disponível? Basta comparecer à biblioteca da escola e informar o
            código de tombo do livro (ex: <code>LIV-0101</code>) e o nome da sua turma. O prazo padrão
            de leitura é de 14 dias com direito a renovação!
          </p>
        </div>

        <button
          onClick={onSwitchToAdmin}
          className="shrink-0 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          Ir para Área Administrativa
        </button>
      </section>
    </div>
  );
};

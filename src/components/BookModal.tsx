import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { lookupBookByISBN } from '../utils/isbnLookup';
import { X, BookPlus, Sparkles, MapPin, Tag, User, ScanBarcode, Loader2 } from 'lucide-react';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook: (bookData: Partial<Book>) => void;
  bookToEdit?: Book | null;
  initialData?: Partial<Book> | null;
  totalBooksCount: number;
}

const GENRE_SUGGESTIONS = [
  'Literatura Brasileira',
  'Literatura Estrangeira',
  'Clássico Juvenil',
  'Infantil / Contos',
  'Ficção Científica & Fantasia',
  'História em Quadrinhos / HQ',
  'História & Geografia',
  'Ciências & Biologia',
  'Poesia & Teatro',
  'Autoajuda & Desenvolvimento',
];

const COLOR_PALETTE = [
  { name: 'Azul Real', value: '#1e3a5f' },
  { name: 'Âmbar Dourado', value: '#b45309' },
  { name: 'Vinho Tinto', value: '#9f1239' },
  { name: 'Verde Floresta', value: '#065f46' },
  { name: 'Terracota', value: '#c2410c' },
  { name: 'Roxo Imperial', value: '#4c1d95' },
  { name: 'Grafite', value: '#374151' },
  { name: 'Marrom Café', value: '#78350f' },
];

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
  bookToEdit,
  initialData,
  totalBooksCount,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [code, setCode] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState(GENRE_SUGGESTIONS[0]);
  const [location, setLocation] = useState('Estante 1 - Prateleira A');
  const [coverColor, setCoverColor] = useState(COLOR_PALETTE[0].value);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSearchingIsbn, setIsSearchingIsbn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (bookToEdit) {
        setTitle(bookToEdit.title);
        setAuthor(bookToEdit.author);
        setCode(bookToEdit.code);
        setIsbn(bookToEdit.isbn || '');
        setGenre(bookToEdit.genre);
        setLocation(bookToEdit.location);
        setCoverColor(bookToEdit.coverColor || COLOR_PALETTE[0].value);
        setNotes(bookToEdit.notes || '');
      } else if (initialData) {
        setTitle(initialData.title || '');
        setAuthor(initialData.author || '');
        setCode(initialData.code || `LIV-${String(totalBooksCount + 101).padStart(4, '0')}`);
        setIsbn(initialData.isbn || '');
        setGenre(initialData.genre || GENRE_SUGGESTIONS[0]);
        setLocation(initialData.location || 'Estante 1 - Prateleira A');
        setCoverColor(initialData.coverColor || COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].value);
        setNotes(initialData.notes || '');
      } else {
        // Defaults for new book
        setTitle('');
        setAuthor('');
        const nextNumber = String(totalBooksCount + 101).padStart(4, '0');
        setCode(`LIV-${nextNumber}`);
        setIsbn('');
        setGenre(GENRE_SUGGESTIONS[0]);
        setLocation('Estante 1 - Prateleira A');
        setCoverColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].value);
        setNotes('');
      }
    }
  }, [isOpen, bookToEdit, initialData, totalBooksCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título do livro é obrigatório.');
      return;
    }
    if (!author.trim()) {
      setError('O autor do livro é obrigatório.');
      return;
    }
    if (!code.trim()) {
      setError('O código de tombo do livro é obrigatório.');
      return;
    }

    onSaveBook({
      title: title.trim(),
      author: author.trim(),
      code: code.trim().toUpperCase(),
      isbn: isbn.trim(),
      genre: genre.trim(),
      location: location.trim(),
      coverColor,
      notes: notes.trim(),
    });

    onClose();
  };

  const handleIsbnAutoLookup = async () => {
    if (!isbn.trim()) return;
    setIsSearchingIsbn(true);
    setError('');
    try {
      const res = await lookupBookByISBN(isbn.trim());
      if (res.found) {
        if (res.title) setTitle(res.title);
        if (res.author) setAuthor(res.author);
        if (res.genre) setGenre(res.genre);
        if (res.notes && !notes) setNotes(res.notes);
      } else {
        setError('Nenhum dado encontrado automaticamente para este ISBN. Por favor, preencha manualmente.');
      }
    } catch {
      setError('Falha ao consultar base online do ISBN.');
    } finally {
      setIsSearchingIsbn(false);
    }
  };

  const generateAutoCode = () => {
    const nextNumber = String(totalBooksCount + 101).padStart(4, '0');
    setCode(`LIV-${nextNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
              <BookPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">
                {bookToEdit ? 'Editar Livro do Acervo' : 'Cadastrar Novo Livro'}
              </h2>
              <p className="text-xs text-stone-300">
                Informações cadastrais para organização da biblioteca
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
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* ISBN / Barcode input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                ISBN / Código de Barras (Opcional)
              </label>
              {isbn && (
                <button
                  type="button"
                  onClick={handleIsbnAutoLookup}
                  disabled={isSearchingIsbn}
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSearchingIsbn ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Buscando dados...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Preencher via ISBN</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="relative">
              <ScanBarcode className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Ex: 9788535902778 (escanear ou digitar)"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Título do Livro *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Dom Casmurro, Memórias Póstumas..."
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Autor(a) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Machado de Assis, Jorge Amado..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              />
            </div>
          </div>

          {/* Code & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Código / Tombo *
                </label>
                <button
                  type="button"
                  onClick={generateAutoCode}
                  className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold cursor-pointer"
                >
                  Gerar código
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: LIV-0105"
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Gênero / Categoria
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  list="genre-list"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="Selecione ou digite..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
                />
                <datalist id="genre-list">
                  {GENRE_SUGGESTIONS.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Location & Cover theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Localização / Estante
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Estante 2 - Prateleira B"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Cor da Capa
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCoverColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      coverColor === c.value
                        ? 'ring-2 ring-stone-900 ring-offset-2 scale-110'
                        : 'hover:scale-105 opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Observações do Livro (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Exemplar com ilustrações, doado pela Associação..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
            />
          </div>

          {/* Footer */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {bookToEdit ? 'Salvar Alterações' : 'Cadastrar Livro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


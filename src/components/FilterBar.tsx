import { Search, LayoutGrid, List, X, Filter } from 'lucide-react';
import { ViewMode } from '../types';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  availableClasses: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedClass,
  setSelectedClass,
  availableClasses,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalFiltered,
}) => {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 sm:p-4 mb-6 shadow-2xs">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor, código ou nome de quem pegou..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 text-stone-800 placeholder-stone-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">Todas as Turmas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {selectedClass && (
              <button
                onClick={() => setSelectedClass('')}
                className="text-stone-400 hover:text-stone-600 p-0.5"
                title="Limpar filtro de turma"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-stone-400 mr-1.5 hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="status">Status (Emprestados primeiro)</option>
              <option value="title">Título (A-Z)</option>
              <option value="author">Autor (A-Z)</option>
              <option value="dueDate">Prazo de devolução</option>
              <option value="code">Código / Tombo</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Visualização em Grade de Livros"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Visualização em Lista / Planilha"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter summary indicators */}
      {(searchQuery || selectedClass) && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>Resultados: <strong className="text-stone-800">{totalFiltered}</strong> livros encontrados</span>
            {selectedClass && (
              <span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                Filtrado por: {selectedClass}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('');
            }}
            className="text-amber-800 hover:text-amber-950 font-medium cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};

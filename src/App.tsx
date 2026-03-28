import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Search } from 'lucide-react'; // El icono de la lupa
import { getPokemonList, getAllPokemonNames } from './services/api';
import { PokemonCard } from './components/PokemonCard';
import { PokemonModal } from './components/PokemonModal';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 } },
});

const PokedexDashboard = () => {
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { ref, inView } = useInView();

  // 1. Scroll Infinito (Para cuando no buscamos nada)
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['pokemons-infinite'],
    queryFn: getPokemonList,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.next ? allPages.length * 20 : undefined,
  });

  // 2. Consulta Global (Para el buscador instantáneo)
  const { data: allPokemonsData } = useQuery({
    queryKey: ['all-pokemons'],
    queryFn: getAllPokemonNames,
    staleTime: Infinity, // Nunca caduca porque los nombres no cambian
  });

  // Efecto para cargar más al bajar (solo si no estamos buscando)
  useEffect(() => {
    if (inView && hasNextPage && !searchTerm) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, searchTerm]);

  // Lógica de filtrado
  const allInfinitePokemons = infiniteData?.pages.flatMap((page) => page.results) ?? [];

  // Si hay texto, filtramos toda la base de datos. Si no, mostramos el scroll infinito.
  // Limitamos a 50 resultados en la búsqueda para que no se congele el navegador renderizando 1000 cartas de golpe.
  const displayPokemons = searchTerm
    ? allPokemonsData?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50) ?? []
    : allInfinitePokemons;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* CABECERA Y BUSCADOR */}
        <header className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-br from-red-500 via-red-500 to-yellow-400 drop-shadow-sm pb-2">
            Pokédex Pro
          </h1>

          {/* Barra de Búsqueda */}
          <div className="mt-8 relative w-full max-w-2xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border-2 border-transparent bg-white rounded-2xl text-lg shadow-sm focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all outline-none"
              placeholder="Busca por nombre (ej. Charizard, Lucario...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute top-16 left-0 right-0 text-center text-sm font-bold text-red-500">
                Mostrando resultados para "{searchTerm}"...
              </div>
            )}
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        {status === 'pending' ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
              {displayPokemons.map((pokemon, index) => (
                <PokemonCard
                  key={`${pokemon.name}-${index}`}
                  pokemon={pokemon}
                  onClick={setSelectedPokemonId}
                />
              ))}
            </div>

            {/* Mensaje de no resultados */}
            {searchTerm && displayPokemons.length === 0 && (
              <div className="text-center text-gray-400 text-xl font-bold mt-20">
                No se ha encontrado ningún Pokémon llamado "{searchTerm}". 😢
              </div>
            )}

            {/* Elemento disparador del Infinite Scroll (Solo se muestra si no estamos buscando) */}
            {!searchTerm && (
              <div ref={ref} className="h-24 flex justify-center items-center mt-8">
                {isFetchingNextPage && (
                  <div className="animate-pulse font-bold text-gray-400 flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                    Capturando más Pokémon...
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <PokemonModal
        pokemonId={selectedPokemonId}
        onClose={() => setSelectedPokemonId(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PokedexDashboard />
    </QueryClientProvider>
  );
}
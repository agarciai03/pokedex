import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Search, AlertTriangle } from 'lucide-react'; // Añadimos icono de error
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

  // 1. Scroll Infinito 
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

  // 2. Consulta Global
  const { data: allPokemonsData } = useQuery({
    queryKey: ['all-pokemons'],
    queryFn: getAllPokemonNames,
    staleTime: Infinity,
  });

  // Efecto para cargar más al bajar
  useEffect(() => {
    if (inView && hasNextPage && !searchTerm) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, searchTerm]);

  // Lógica de filtrado
  const allInfinitePokemons = infiniteData?.pages.flatMap((page) => page.results) ?? [];
  const displayPokemons = searchTerm
    ? allPokemonsData?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50) ?? []
    : allInfinitePokemons;

  const isHacked = searchTerm.toLowerCase() === 'missingno';

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-all duration-100 ${isHacked ? 'hacked-screen bg-black' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">

        <header className="text-center mb-12 flex flex-col items-center pt-6">
          <h1 className="text-6xl md:text-8xl font-pokemon text-pokemon-logo drop-shadow-lg pb-4 transform hover:scale-105 transition-transform duration-300 cursor-default tracking-widest">
            Pokédex
          </h1>

          <div className="mt-8 relative w-full max-w-2xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-[#3b4cca] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border-4 border-white bg-white/90 backdrop-blur-sm rounded-full text-lg shadow-xl focus:border-[#ffcb05] focus:ring-4 focus:ring-[#3b4cca]/30 transition-all outline-none text-gray-700 font-bold placeholder-gray-400"
              placeholder="Busca un Pokémon (ej. Pikachu, Gengar...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute top-20 left-0 right-0 text-center text-sm font-black text-[#ef5350] bg-white/80 rounded-full py-1 mx-auto max-w-xs shadow-sm">
                {isHacked ? "⛔ CORRUPCIÓN DE DATOS ⛔" : `Buscando: "${searchTerm}"...`}
              </div>
            )}
          </div>
        </header>

        {/* MANEJO DE ESTADOS LIMPIO */}
        {status === 'pending' ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 font-bold text-xl">
            <AlertTriangle className="w-12 h-12 mb-4" />
            ¡Error al conectar con la base de datos Pokémon!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
              {/* Quitamos el 'index' que podía dar warning y usamos name como clave única */}
              {displayPokemons.map((pokemon) => (
                <PokemonCard
                  key={pokemon.name}
                  pokemon={pokemon}
                  onClick={setSelectedPokemonId}
                />
              ))}
            </div>

            {searchTerm && displayPokemons.length === 0 && !isHacked && (
              <div className="text-center text-gray-400 text-xl font-bold mt-20">
                No se ha encontrado ningún Pokémon llamado "{searchTerm}". 😢
              </div>
            )}

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
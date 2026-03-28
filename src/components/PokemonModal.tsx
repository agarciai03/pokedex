import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Tilt from 'react-parallax-tilt'; // Importamos la librería para el efecto 3D
import { getPokemonDetails, getPokemonCards } from '../services/api';
import { typeColors } from '../types/pokemon';

interface Props {
    pokemonId: string | null;
    onClose: () => void;
}

export const PokemonModal = ({ pokemonId, onClose }: Props) => {
    // 1. Buscamos los detalles básicos (PokéAPI)
    const { data: pokemon, isLoading } = useQuery({
        queryKey: ['pokemon', pokemonId],
        queryFn: () => getPokemonDetails(pokemonId!),
        enabled: !!pokemonId,
    });

    // 2. Buscamos las cartas usando el nombre del Pokémon (TCG API)
    // Solo se ejecuta si ya sabemos el nombre del Pokémon
    const { data: cards, isLoading: isLoadingCards } = useQuery({
        queryKey: ['pokemonCards', pokemon?.name],
        queryFn: () => getPokemonCards(pokemon!.name),
        enabled: !!pokemon?.name,
    });

    const imageUrl = pokemonId
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
        : '';

    return (
        <AnimatePresence>
            {pokemonId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Fondo oscuro desenfocado */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Tarjeta del Modal */}
                    <motion.div
                        layoutId={`pokemon-${pokemonId}`}
                        className="relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl z-10 custom-scrollbar"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 z-20 transition-colors"
                        >
                            ❌
                        </button>

                        {isLoading ? (
                            <div className="h-96 flex items-center justify-center text-xl font-bold animate-pulse text-gray-500">
                                Analizando Pokémon...
                            </div>
                        ) : (
                            pokemon && (
                                <>
                                    {/* Cabecera y Stats */}
                                    <div className={`pt-12 pb-24 px-6 flex flex-col items-center rounded-b-[3rem] ${typeColors[pokemon.types[0].type.name] || 'bg-gray-400'} transition-colors duration-500`}>
                                        <h2 className="text-4xl font-black text-white capitalize drop-shadow-md">
                                            {pokemon.name}
                                        </h2>
                                        <div className="flex gap-2 mt-3">
                                            {pokemon.types.map((t) => (
                                                <span key={t.type.name} className="bg-white/25 text-white px-4 py-1 rounded-full text-sm font-bold capitalize backdrop-blur-md shadow-sm">
                                                    {t.type.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Imagen del Pokémon */}
                                    <div className="relative flex justify-center -mt-24 mb-6">
                                        <img src={imageUrl} alt={pokemon.name} className="w-48 h-48 drop-shadow-2xl z-10 hover:scale-110 transition-transform duration-300" />
                                    </div>

                                    {/* Estadísticas */}
                                    <div className="px-8 pb-4">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Estadísticas Base</h3>
                                        <div className="space-y-3">
                                            {pokemon.stats.map((stat) => (
                                                <div key={stat.stat.name} className="flex items-center text-sm">
                                                    <span className="w-28 text-gray-500 font-semibold capitalize">
                                                        {stat.stat.name.replace('-', ' ')}
                                                    </span>
                                                    <span className="w-8 font-black text-right mr-3 text-gray-700">
                                                        {stat.base_stat}
                                                    </span>
                                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${stat.base_stat > 75 ? 'bg-green-400' : stat.base_stat > 45 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SECCIÓN DE CARTAS TCG CON EFECTO 3D */}
                                    <div className="px-8 pb-8 mt-6 border-t border-gray-100 pt-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Cartas Oficiales TCG</h3>

                                        {isLoadingCards ? (
                                            <div className="text-center text-gray-400 animate-pulse text-sm">Buscando cartas en el archivo...</div>
                                        ) : cards && cards.length > 0 ? (
                                            <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar items-center">
                                                {cards.map((card) => (
                                                    <div key={card.id} className="min-w-37.5 snap-center shrink-0">
                                                        {/* AQUÍ ESTÁ EL EFECTO HOLOGRÁFICO */}
                                                        <Tilt
                                                            glareEnable={true}
                                                            glareMaxOpacity={0.6}
                                                            glareColor="#ffffff"
                                                            glarePosition="all"
                                                            tiltMaxAngleX={15}
                                                            tiltMaxAngleY={15}
                                                            scale={1.05}
                                                            transitionSpeed={2500}
                                                            className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
                                                        >
                                                            <img
                                                                src={card.images.small}
                                                                alt={card.name}
                                                                className="w-full rounded-xl"
                                                                loading="lazy"
                                                            />
                                                        </Tilt>
                                                        <p className="text-xs text-center mt-3 text-gray-500 truncate px-1 font-medium">
                                                            {card.set.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400 text-sm">No se encontraron cartas oficiales.</div>
                                        )}
                                    </div>
                                </>
                            )
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
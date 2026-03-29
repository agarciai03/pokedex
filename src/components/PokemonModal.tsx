import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Tilt from 'react-parallax-tilt';
import { getPokemonDetails, getPokemonCards } from '../services/api';
import { typeColors } from '../types/pokemon';

interface Props { pokemonId: string | null; onClose: () => void; }

export const PokemonModal = ({ pokemonId, onClose }: Props) => {
    const [isShiny, setIsShiny] = useState(false); // <-- Estado para la versión Rara

    const { data: pokemon, isLoading } = useQuery({
        queryKey: ['pokemon', pokemonId],
        queryFn: () => getPokemonDetails(pokemonId!),
        enabled: !!pokemonId,
    });

    const { data: cards, isLoading: isLoadingCards } = useQuery({
        queryKey: ['pokemonCards', pokemon?.name],
        queryFn: () => getPokemonCards(pokemon!.name),
        enabled: !!pokemon?.name,
    });

    // Función mágica para reproducir los audios
    const playCry = (audioUrl: string) => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.volume = 0.5;
            audio.play();
        }
    };

    // Elegimos la imagen según si el botón Shiny está pulsado o no
    const currentImageUrl = pokemon?.sprites.other['official-artwork'][isShiny ? 'front_shiny' : 'front_default']
        || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

    return (
        <AnimatePresence>
            {pokemonId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { onClose(); setIsShiny(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" />

                    <motion.div layoutId={`pokemon-${pokemonId}`} className="relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl z-10 custom-scrollbar">

                        {/* Botón Cerrar */}
                        <button onClick={() => { onClose(); setIsShiny(false); }} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 z-20 transition-colors">❌</button>

                        {/* BOTÓN SHINY (Estrella) */}
                        {pokemon && pokemon.sprites.other['official-artwork'].front_shiny && (
                            <button
                                onClick={() => setIsShiny(!isShiny)}
                                className={`absolute top-4 left-4 p-2 rounded-full z-20 transition-all shadow-md flex items-center gap-2 font-bold text-sm ${isShiny ? 'bg-yellow-400 text-white animate-pulse' : 'bg-white/80 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600'}`}
                                title="Versión Variocolor"
                            >
                                ✨ {isShiny ? 'SHINY ACTIVO' : 'Ver Shiny'}
                            </button>
                        )}

                        {isLoading ? (
                            <div className="h-96 flex items-center justify-center text-xl font-bold animate-pulse text-gray-500">Analizando Datos...</div>
                        ) : (
                            pokemon && (
                                <>
                                    {/* Cabecera (Si es shiny, forzamos un color oscuro/dorado, si no, su tipo) */}
                                    <div className={`pt-16 pb-24 px-6 flex flex-col items-center rounded-b-[3rem] ${isShiny ? 'bg-gray-800' : typeColors[pokemon.types[0].type.name] || 'bg-gray-400'} transition-colors duration-500`}>
                                        <h2 className={`text-4xl font-black capitalize drop-shadow-md ${isShiny ? 'text-yellow-400' : 'text-white'}`}>{pokemon.name}</h2>

                                        {/* BOTONES DE AUDIO 📻 */}
                                        <div className="flex gap-4 mt-4">
                                            <button onClick={() => playCry(pokemon.cries.legacy)} className="bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border border-white/30 transition-all flex items-center gap-1">
                                                👾 GameBoy Cry
                                            </button>
                                            <button onClick={() => playCry(pokemon.cries.latest)} className="bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border border-white/30 transition-all flex items-center gap-1">
                                                🎙️ Switch Cry
                                            </button>
                                        </div>
                                    </div>

                                    {/* Imagen dinámica (Normal o Shiny) */}
                                    <div className="relative flex justify-center -mt-24 mb-6">
                                        <motion.img
                                            key={currentImageUrl} // Forzamos a que re-anime si cambia la imagen
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            src={currentImageUrl}
                                            alt={pokemon.name}
                                            className={`w-48 h-48 drop-shadow-2xl z-10 transition-transform duration-300 ${isShiny ? 'drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]' : 'hover:scale-110'}`}
                                        />
                                    </div>

                                    {/* Estadísticas (Igual que antes) */}
                                    <div className="px-8 pb-4">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Estadísticas Base</h3>
                                        <div className="space-y-3">
                                            {pokemon.stats.map((stat) => (
                                                <div key={stat.stat.name} className="flex items-center text-sm">
                                                    <span className="w-28 text-gray-500 font-semibold capitalize">{stat.stat.name.replace('-', ' ')}</span>
                                                    <span className="w-8 font-black text-right mr-3 text-gray-700">{stat.base_stat}</span>
                                                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full ${stat.base_stat > 75 ? 'bg-green-400' : stat.base_stat > 45 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cartas TCG (Igual que antes, con el efecto Holográfico) */}
                                    <div className="px-8 pb-8 mt-6 border-t border-gray-100 pt-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Cartas Oficiales TCG</h3>
                                        {isLoadingCards ? (
                                            <div className="text-center text-gray-400 animate-pulse text-sm">Buscando cartas...</div>
                                        ) : cards && cards.length > 0 ? (
                                            <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar items-center">
                                                {cards.map((card) => (
                                                    <div key={card.id} className="min-w-37.5 snap-center shrink-0">
                                                        <Tilt glareEnable={true} glareMaxOpacity={0.6} glareColor="#ffffff" glarePosition="all" tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={2500} className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer card-holo-effect">
                                                            <img src={card.images.small} alt={card.name} className="w-full rounded-xl" loading="lazy" />
                                                        </Tilt>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (<div className="text-center text-gray-400 text-sm">No se encontraron cartas oficiales.</div>)}
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
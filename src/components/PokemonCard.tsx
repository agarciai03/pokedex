import { motion } from 'framer-motion';
import { type PokemonBasic, extractPokemonId } from '../types/pokemon';

interface Props {
    pokemon: PokemonBasic;
    onClick: (id: string) => void;
}

export const PokemonCard = ({ pokemon, onClick }: Props) => {
    const id = extractPokemonId(pokemon.url);
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    return (
        <motion.div
            layoutId={`pokemon-${id}`}
            onClick={() => onClick(id)}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl p-5 flex flex-col items-center cursor-pointer border border-gray-100 transition-all"
        >
            <div className="relative w-32 h-32 mb-4">
                <div className="absolute bottom-0 w-full h-4 bg-black/10 rounded-full blur-md"></div>
                <img
                    src={imageUrl}
                    alt={pokemon.name}
                    className="relative z-10 w-full h-full object-contain drop-shadow-md"
                    loading="lazy"
                />
            </div>

            <span className="text-xs font-bold text-gray-400 mb-1 tracking-widest">
                Nº {id.padStart(4, '0')}
            </span>
            <h2 className="text-xl font-extrabold text-gray-800 capitalize">
                {pokemon.name}
            </h2>
        </motion.div>
    );
};
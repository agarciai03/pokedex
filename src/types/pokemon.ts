export interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonBasic[];
}

export interface PokemonBasic {
    name: string;
    url: string;
}

export interface PokemonDetail {
    id: number;
    name: string;
    weight: number;
    height: number;
    types: { type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    cries: {
        latest: string;
        legacy: string;
    };
    sprites: {
        other: {
            'official-artwork': {
                front_default: string;
                front_shiny: string;
            };
        };
    };
}

export const extractPokemonId = (url: string): string => {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1];
};

// Diccionario de colores según el tipo de Pokémon para el diseño dinámico
export const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-300',
    fighting: 'bg-orange-600',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-300',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
};

export interface PokemonTcgCard {
    id: string;
    name: string;
    images: {
        small: string;
        large: string;
    };
    set: {
        name: string;
        series: string;
    };
    rarity?: string;
}
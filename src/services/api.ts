import axios from 'axios';
import type { PokemonListResponse, PokemonDetail, PokemonTcgCard, PokemonBasic } from '../types/pokemon';

const API_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async ({ pageParam = 0 }): Promise<PokemonListResponse> => {
    // pageParam será el "offset" (cuántos Pokémon saltarnos para la siguiente página)
    const response = await axios.get(`${API_URL}/pokemon?limit=20&offset=${pageParam}`);
    return response.data;
};

export const getPokemonDetails = async (idOrName: string): Promise<PokemonDetail> => {
    const response = await axios.get(`${API_URL}/pokemon/${idOrName}`);
    return response.data;
};

export const getPokemonCards = async (pokemonName: string): Promise<PokemonTcgCard[]> => {
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards?q=name:"${pokemonName}"&pageSize=10`);
    return response.data.data;
};

export const getAllPokemonNames = async (): Promise<PokemonBasic[]> => {
    const response = await axios.get(`${API_URL}/pokemon?limit=10000`);
    return response.data.results;
};
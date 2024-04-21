import {Stat} from "pokenode-ts";

export const POKEMON_NOT_FOUND_ERROR_MESSAGE = "The Pokémon you're searching for could not be found.";

export const STAT_MAP: Record<Stat["name"] | string, { label: string, backgroundColor?: string }> = {
  "hp": {label: "HP", backgroundColor: "bg-red-200"},
  "attack": {label: "Atk", backgroundColor: "bg-orange-200"},
  "defense": {label: "Def", backgroundColor: "bg-yellow-200"},
  "special-attack": {label: "Sp. Atk", backgroundColor: "bg-blue-200"},
  "special-defense": {label: "Sp. Def", backgroundColor: "bg-green-200"},
  "speed": {label: "Speed", backgroundColor: "bg-pink-200"},
};

// KIV: proper colour matching
export const TYPE_MAP: Record<string, string> = {
  normal: "bg-slate-400",
  fighting: "bg-orange-600",
  flying: "bg-sky-600",
  poison: "bg-purple-600",
  ground: "bg-amber-600",
  rock: "bg-stone-600",
  bug: "bg-lime-600",
  ghost: "bg-violet-600",
  steel: "bg-cyan-600",
  fire: "bg-red-600",
  water: "bg-blue-600",
  grass: "bg-green-600",
  electric: "bg-yellow-600",
  psychic: "bg-rose-600",
  ice: "bg-cyan-600",
  dragon: "bg-indigo-600",
  dark: "bg-neutral-600",
  fairy: "bg-pink-600",
  unknown: "bg-gray-600",
  shadow: "bg-gray-600",
};

// #0001, bulbasaur, Bulbasaur, 1, 0001, nidoran-f, `nidoran f`
export const SEARCH_REG_EXP = /^(?:#[0-9]+|[a-zA-Z0-9-\s]+)$/;


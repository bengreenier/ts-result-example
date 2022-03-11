import axios from "axios";
import { ForceFailError, InvalidResponseError } from "./errors";

export interface PokemonSpecies {
  // there's a bunch more stuff, but we don't care to type it
  [key: string | symbol | number]: any;

  base_happiness: number;
  capture_rate: number;
  name: string;
}

export interface Pokemon {
  rate: number;
  pokemon_species: {
    name: string;
    url: string;
  };
}

export interface PokemonResponse {
  id: number;
  name: string;
  pokemon_species_details: Pokemon[];
}

/**
 * This isn't a great solution, ideally we'd let typescript generate this or use a mock
 * However this is easier for demo purposes
 */
type WorkFunctionNames =
  | "loadPokemon"
  | "loadPokemonSpecies"
  | "extractSpeciesNames"
  | "prefixSpeciesName";

/**
 * A map to force failures
 * Setting any of these to true cause the corresponding function to throw a `ForceFailError`
 */
export const forceFailMap = new Map<WorkFunctionNames, boolean>([
  ["loadPokemon", false],
  ["loadPokemonSpecies", false],
  ["extractSpeciesNames", false],
  ["prefixSpeciesName", false],
]);

/**
 * Loads pokemon from the server, loads their species', prefixes and returns the names
 * @returns species names
 */
export async function loadPokemon() {
  if (forceFailMap.get("loadPokemon")) {
    throw new ForceFailError("loadPokemon");
  }

  const res = await axios.get<PokemonResponse>(
    "https://pokeapi.co/api/v2/gender/3/"
  );

  if (!res.data.id) {
    throw new InvalidResponseError("id", res.data);
  }

  const species = await Promise.all(
    res.data.pokemon_species_details.map((pokemon) =>
      loadPokemonSpecies(pokemon.pokemon_species.url)
    )
  );

  return extractSpeciesNames(species);
}

/**
 * Loads a species by url
 * @param url - the species url
 * @returns the species
 */
export async function loadPokemonSpecies(url: string) {
  if (forceFailMap.get("loadPokemonSpecies")) {
    throw new ForceFailError("loadPokemonSpecies");
  }

  const res = await axios.get<PokemonSpecies>(url);

  if (!res.data.name) {
    throw new InvalidResponseError("name", res.data);
  }

  return res.data;
}

/**
 * Extracts just the names from species data
 * @param data - species data
 * @returns the names
 */
export function extractSpeciesNames(data: PokemonSpecies[]) {
  if (forceFailMap.get("extractSpeciesNames")) {
    throw new ForceFailError("extractSpeciesNames");
  }

  return data.map((d) => prefixSpeciesName(d.name));
}

/**
 * Prefixes species' names
 * @param name - the name to prefix
 * @returns prefixed name
 */
export function prefixSpeciesName(name: string) {
  if (forceFailMap.get("prefixSpeciesName")) {
    throw new ForceFailError("prefixSpeciesName");
  }

  return `species:${name}`;
}

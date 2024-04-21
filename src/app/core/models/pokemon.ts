import {Pokemon, PokemonSprites} from "pokenode-ts";

export type PokemonPaginationParams = Partial<{
  limit: number,
  offset: number
}>;

// incomplete typing from wrapper library
export type PokemonExtended = Pokemon & {
  sprites: {
    other?: {
      showdown?: Omit<PokemonSprites, "other" | "versions">
    }
  }
};

import {ResolveFn, Router} from "@angular/router";
import {DETAIL_ROUTE_PARAM, ERROR_PATH, NAVIGATE_STATE_ERROR_MESSAGE} from "../constants/app";
import {DestroyRef, inject} from "@angular/core";
import {PokeApiService} from "../services/poke-api.service";
import {catchError, EMPTY, map, take} from "rxjs";
import {PokemonExtended} from "../models/pokemon";
import {POKEMON_NOT_FOUND_ERROR_MESSAGE} from "../constants/pokemon";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export const pokemonResolver: ResolveFn<PokemonExtended> = (route) => {
  const router = inject(Router);
  const destroyRef = inject(DestroyRef);

  return inject(PokeApiService).getPokemonByNameOrId$(route.params[DETAIL_ROUTE_PARAM], {error: true}).pipe(
    take(1),
    map((result) => {
      return result;
    }),
    catchError(() => {
      router.navigate([ERROR_PATH], {
        state: {
          [NAVIGATE_STATE_ERROR_MESSAGE]: POKEMON_NOT_FOUND_ERROR_MESSAGE
        }
      });
      return EMPTY;
    }),
    takeUntilDestroyed(destroyRef)
  );
};

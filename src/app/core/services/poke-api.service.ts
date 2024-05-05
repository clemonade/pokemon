import {inject, Injectable} from "@angular/core";
import {Ability, EvolutionChain, NamedAPIResourceList, PokemonSpecies, Type} from "pokenode-ts";
import {HttpClient, HttpContext} from "@angular/common/http";
import {PokemonExtended, PokemonPaginationParams} from "../models/pokemon";
import {BYPASS_ERROR_INTERCEPTOR} from "../interceptors/error.interceptor";
import {Observable} from "rxjs";
import {BYPASS_LOADING_INTERCEPTOR} from "../interceptors/loading.interceptor";
import {BypassInterceptor} from "../models/app";

@Injectable({
  providedIn: "root"
})
export class PokeApiService {
  protected readonly POKEMON_ENDPOINT = "https://pokeapi.co/api/v2";
  httpClient = inject(HttpClient);

  getPokemons$: (params?: PokemonPaginationParams) => Observable<NamedAPIResourceList> = (params?: PokemonPaginationParams) => this.httpClient.get<NamedAPIResourceList>(`${this.POKEMON_ENDPOINT}/pokemon/`, {params});
  getPokemonByNameOrId$: (nameOrId: (string | number), bypassInterceptor?: BypassInterceptor) => Observable<PokemonExtended> = (nameOrId: string | number, bypassInterceptor?: BypassInterceptor) => {
    const context = new HttpContext().set(BYPASS_LOADING_INTERCEPTOR, bypassInterceptor?.loading);
    context.set(BYPASS_ERROR_INTERCEPTOR, bypassInterceptor?.error);
    return this.httpClient.get<PokemonExtended>(`${this.POKEMON_ENDPOINT}/pokemon/${nameOrId}`, {context});
  };
  getTypeByNameOrId$: (nameOrId: (string | number)) => Observable<Type> = (nameOrId: string | number) => this.httpClient.get<Type>(`${this.POKEMON_ENDPOINT}/type/${nameOrId}`);
  getAbilityByNameOrId$: (nameOrId: (string | number)) => Observable<Ability> = (nameOrId: string | number) => this.httpClient.get<Ability>(`${this.POKEMON_ENDPOINT}/ability/${nameOrId}`);
  getSpeciesByNameOrId$: (nameOrId: (string | number)) => Observable<PokemonSpecies> = (nameOrId: string | number) => this.httpClient.get<PokemonSpecies>(`${this.POKEMON_ENDPOINT}/pokemon-species/${nameOrId}`);
  getEvolutionChainById$: (id: number) => Observable<EvolutionChain> = (id: number) => this.httpClient.get<EvolutionChain>(`${this.POKEMON_ENDPOINT}/evolution-chain/${id}`);
}

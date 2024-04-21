import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from "@angular/core";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {EMPTY, map, merge, mergeMap, switchMap, tap} from "rxjs";
import {CardComponent} from "../../shared/components/card/card.component";
import {AsyncPipe, KeyValuePipe, NgTemplateOutlet, TitleCasePipe} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {PokeApiService} from "../../core/services/poke-api.service";
import {Ability, EvolutionChain, PokemonSpecies, Type} from "pokenode-ts";
import {PokemonExtended} from "../../core/models/pokemon";
import {DEFAULT_PATH, LANGUAGE, UNDERSCORE_REG_EXP} from "../../core/constants/app";
import {MatAnchor, MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ReplacePipe} from "../../shared/pipes/replace.pipe";
import {TYPE_MAP} from "../../core/constants/pokemon";
import {TagComponent} from "../../shared/components/tag/tag.component";
import {SearchComponent} from "../../shared/components/search/search.component";
import {UrlIdPipe} from "../../shared/pipes/urlId.pipe";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    CardComponent,
    AsyncPipe,
    KeyValuePipe,
    NgTemplateOutlet,
    RouterLink,
    MatButton,
    MatIcon,
    ReplacePipe,
    TitleCasePipe,
    TagComponent,
    MatAnchor,
    SearchComponent,
    UrlIdPipe
  ],
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UrlIdPipe]
})
export class DetailComponent implements OnInit {
  pokeApiService = inject(PokeApiService);
  idPipe = inject(UrlIdPipe);
  activatedRoute = inject(ActivatedRoute);
  changeDetectorRef = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);

  pokemon?: PokemonExtended;
  types: Record<string, Type> = {};
  abilities: Record<string, Ability> = {};
  species?: PokemonSpecies;
  evolutionChain?: EvolutionChain;

  protected readonly LANGUAGE = LANGUAGE;
  protected readonly DEFAULT_PATH = DEFAULT_PATH;
  protected readonly UNDERSCORE_REG_EXP = UNDERSCORE_REG_EXP;
  protected readonly TYPE_MAP = TYPE_MAP;

  pokemon$ = this.activatedRoute.data.pipe(
    map(({pokemon}) => {
      return pokemon;
    }),
    tap((pokemon) => {
      this.pokemon = pokemon;
    }),
  );

  types$ = this.pokemon$.pipe(
    switchMap((pokemon: PokemonExtended) => {
      return pokemon.types.map(type => type.type.name);
    }),
    mergeMap((typeName) => {
      return this.pokeApiService.getTypeByNameOrId$(typeName);
    }),
    tap((type) => {
      this.types[type.name] = type;
    }),
  );

  abilities$ = this.pokemon$.pipe(
    switchMap((pokemon: PokemonExtended) => {
      return pokemon.abilities.map(ability => ability.ability.name);
    }),
    mergeMap((abilityName) => {
      return this.pokeApiService.getAbilityByNameOrId$(abilityName);
    }),
    tap((ability) => {
      this.abilities[ability.name] = ability;
    }),
  );

  species$ = this.pokemon$.pipe(
    switchMap((pokemon: PokemonExtended) => {
      return this.pokeApiService.getSpeciesByNameOrId$(pokemon.species.name);
    }),
    tap((species) => {
      this.species = species;
    }),
    switchMap((species) => {
      const id = this.idPipe.transform(species.evolution_chain.url);
      if (id)
        return this.pokeApiService.getEvolutionChainById$(+id);
      else
        return EMPTY;
    }),
    tap((evolutionChain) => {
      this.evolutionChain = evolutionChain;
    }),
  );

  ngOnInit(): void {
    merge(this.types$, this.abilities$, this.species$).pipe(
      tap(() => {
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}

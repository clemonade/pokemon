import {ChangeDetectionStrategy, Component, inject} from "@angular/core";
import {ActivatedRoute, Data, RouterLink} from "@angular/router";
import {EMPTY, map, mergeMap, scan, switchMap} from "rxjs";
import {CardComponent} from "../../shared/components/card/card.component";
import {AsyncPipe, KeyValuePipe, NgTemplateOutlet, TitleCasePipe} from "@angular/common";
import {PokeApiService} from "../../core/services/poke-api.service";
import {Ability, Type} from "pokenode-ts";
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
export class DetailComponent {
  pokeApiService = inject(PokeApiService);
  idPipe = inject(UrlIdPipe);
  activatedRoute = inject(ActivatedRoute);

  protected readonly LANGUAGE = LANGUAGE;
  protected readonly DEFAULT_PATH = DEFAULT_PATH;
  protected readonly UNDERSCORE_REG_EXP = UNDERSCORE_REG_EXP;
  protected readonly TYPE_MAP = TYPE_MAP;

  pokemon$ = this.activatedRoute.data.pipe(
    map<Data, PokemonExtended>(({pokemon}) => {
      return pokemon;
    }),
  );

  evolutionChain$ = this.pokemon$.pipe(
    switchMap((pokemon) => {
      return this.pokeApiService.getSpeciesByNameOrId$(pokemon.species.name);
    }),
    switchMap((species) => {
      const id = this.idPipe.transform(species.evolution_chain.url);
      if (id)
        return this.pokeApiService.getEvolutionChainById$(+id);
      else
        return EMPTY;
    }),
  );

  abilities$ = this.pokemon$.pipe(
    switchMap((pokemon) => {
      return pokemon.abilities.map(ability => ability.ability.name);
    }),
    mergeMap((abilityName) => {
      return this.pokeApiService.getAbilityByNameOrId$(abilityName);
    }),
    scan<Ability, Record<string, Ability>>((acc, ability) => {
      return {
        ...acc,
        [ability.name]: ability
      };
    }, {})
  );

  types$ = this.pokemon$.pipe(
    switchMap((pokemon) => {
      return pokemon.types.map(type => type.type.name);
    }),
    mergeMap((typeName) => {
      return this.pokeApiService.getTypeByNameOrId$(typeName);
    }),
    scan<Type, Record<string, Type>>((acc, type) => {
      return {
        ...acc,
        [type.name]: type
      };
    }, {})
  );
}

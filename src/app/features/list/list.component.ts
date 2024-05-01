import {ChangeDetectionStrategy, Component, inject, ViewChild} from "@angular/core";
import {PokeApiService} from "../../core/services/poke-api.service";
import {NamedAPIResource, NamedAPIResourceList} from "pokenode-ts";
import {
  BehaviorSubject,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  mergeMap,
  scan,
  share,
  startWith,
  switchMap,
  tap,
  withLatestFrom
} from "rxjs";
import {PokemonExtended} from "../../core/models/pokemon";
import {CardComponent} from "../../shared/components/card/card.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {DEFAULT_PATH, PAGINATION_PARAMS_LIMIT, WINDOWS_RESIZE_DEBOUNCE_TIME} from "../../core/constants/app";
import {RouterLink} from "@angular/router";
import {CARD_GAP_PX, CARD_HEIGHT_PX, CARD_WIDTH_PX} from "../../core/constants/style";
import {SearchComponent} from "../../shared/components/search/search.component";
import {AsyncPipe} from "@angular/common";
import {chunk} from "../../shared/utils/chunk";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    CardComponent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    RouterLink,
    SearchComponent,
    AsyncPipe
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  pokeApiService = inject(PokeApiService);

  offset = new BehaviorSubject(0);
  end = false;

  protected readonly CARD_HEIGHT_PX = CARD_HEIGHT_PX;
  protected readonly DEFAULT_PATH = DEFAULT_PATH;

  offset$ = this.offset.pipe(
    concatMap((offset) => this.pokeApiService.getPokemons$({offset, limit: PAGINATION_PARAMS_LIMIT})),
    tap(({count}) => this.end = this.offset.value >= count),
    share()
  );

  pokedex$ = this.offset$.pipe(
    switchMap(({results}) => results.map(pokemon => pokemon.name)),
    mergeMap(name => this.pokeApiService.getPokemonByNameOrId$(name)),
    scan<PokemonExtended, Record<string, PokemonExtended | undefined>>((acc, pokemon) => {
      acc[pokemon.name] = pokemon;
      return acc;
    }, {}),
    startWith<Record<string, PokemonExtended | undefined>>({})
  );

  pokemons$ = this.offset$.pipe(
    scan<NamedAPIResourceList, NamedAPIResource[]>((acc, {results}) => [...acc, ...results], []),
    startWith<NamedAPIResource[]>([])
  );

  windowResize$ = fromEvent(window, "resize").pipe(
    debounceTime(WINDOWS_RESIZE_DEBOUNCE_TIME),
    map(this.chunkSize),
    distinctUntilChanged()
  );

  chunkLatestPokemons$ = this.offset$.pipe(
    withLatestFrom(this.windowResize$.pipe(startWith(this.chunkSize()))),
    scan<[NamedAPIResourceList, number], NamedAPIResource[][]>((acc, [{results}, chunkSize]) => {
      const fill = acc.length ? chunkSize - acc[acc.length - 1].length : 0;
      const resultsClone = [...results]; // avoid source mutation from splice
      if (fill) {
        resultsClone.splice(0, fill).forEach(pokemon => acc[acc.length - 1].push(pokemon));
      }
      return [...acc, ...chunk(resultsClone, chunkSize)];
    }, [])
  );

  chunkPokemons$ = this.windowResize$.pipe(
    withLatestFrom(this.pokemons$),
    map(([chunkSize, pokemons]) => chunk(pokemons, chunkSize))
  );

  chunkedPokemons$ = merge(this.chunkLatestPokemons$, this.chunkPokemons$);

  @ViewChild(CdkVirtualScrollViewport)
  cdkVirtualScrollViewport!: CdkVirtualScrollViewport;

  scrollIndexChanged(): void {
    if (this.end) {
      return;
    }
    const end = this.cdkVirtualScrollViewport.getRenderedRange().end;
    const total = this.cdkVirtualScrollViewport.getDataLength();
    if (end === total) {
      this.offset.next(this.offset.value + PAGINATION_PARAMS_LIMIT);
    }
  }

  chunkSize(): number {
    const chunkSize = Math.floor(window.innerWidth / CARD_WIDTH_PX) || 1;
    return Math.floor((window.innerWidth - (chunkSize * CARD_GAP_PX)) / CARD_WIDTH_PX) || 1;
  }

  trackByIndex = (index: number): number => index;
}

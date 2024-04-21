import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from "@angular/core";
import {PokeApiService} from "../../core/services/poke-api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NamedAPIResource} from "pokenode-ts";
import {
  BehaviorSubject,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  mergeMap,
  switchMap,
  tap
} from "rxjs";
import {PokemonExtended} from "../../core/models/pokemon";
import {CardComponent} from "../../shared/components/card/card.component";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {DEFAULT_PATH, PAGINATION_PARAMS_LIMIT, WINDOWS_RESIZE_DEBOUNCE_TIME} from "../../core/constants/app";
import {RouterLink} from "@angular/router";
import {CARD_GAP_PX, CARD_HEIGHT_PX, CARD_WIDTH_PX} from "../../core/constants/style";
import {SearchComponent} from "../../shared/components/search/search.component";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    CardComponent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    RouterLink,
    SearchComponent
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  pokeApiService = inject(PokeApiService);
  changeDetectorRef = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);

  pokemons: NamedAPIResource[] = [];
  chunkedPokemons: NamedAPIResource[][] = [];
  pokedex: Record<string, PokemonExtended | undefined> = {};

  offset = new BehaviorSubject(0);
  end = false;

  protected readonly CARD_HEIGHT_PX = CARD_HEIGHT_PX;
  protected readonly DEFAULT_PATH = DEFAULT_PATH;

  pokemons$ = this.offset.pipe(
    concatMap((offset) => {
      return this.pokeApiService.getPokemons$({offset, limit: PAGINATION_PARAMS_LIMIT});
    }),
    tap(({results, count}) => {
      this.pokemons = [...this.pokemons, ...results];
      this.chunkPokemons(); // TODO: chunk result only and merge instead
      this.end = this.offset.value >= count;
    }),
    switchMap(({results}) => {
      return results.map(pokemon => pokemon.name);
    }),
    mergeMap(name => this.pokeApiService.getPokemonByNameOrId$(name)),
    tap((pokemon) => {
      this.pokedex[pokemon.name] = pokemon;
    }),
  );

  windowResize$ = fromEvent(window, "resize").pipe(
    debounceTime(WINDOWS_RESIZE_DEBOUNCE_TIME),
    map(() => {
      return this.getCardsPerRow();
    }),
    distinctUntilChanged(),
    tap(() => {
      this.chunkPokemons();
    }),
  );

  @ViewChild(CdkVirtualScrollViewport)
  cdkVirtualScrollViewport!: CdkVirtualScrollViewport;

  ngOnInit(): void {
    merge(this.pokemons$, this.windowResize$).pipe(
      tap(() => {
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)).subscribe();
  }

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

  chunkPokemons(): void {
    const cardsPerRow = this.getCardsPerRow();
    this.chunkedPokemons = this.pokemons.reduce((acc: NamedAPIResource[][], curr: NamedAPIResource, index: number) => {
      if (index % cardsPerRow === 0) acc.push([curr]);
      else acc[acc.length - 1].push(curr);
      return acc;
    }, []);
  }

  getCardsPerRow(): number {
    const cardsPerRow = Math.floor(window.innerWidth / CARD_WIDTH_PX) || 1;
    return Math.floor((window.innerWidth - (cardsPerRow * CARD_GAP_PX)) / CARD_WIDTH_PX) || 1;
  }

  trackByIndex = (index: number): number => index;
}

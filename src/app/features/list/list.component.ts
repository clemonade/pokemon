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
import {NamedAPIResource, NamedAPIResourceList} from "pokenode-ts";
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  mergeMap,
  scan,
  share,
  startWith,
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
import {AsyncPipe} from "@angular/common";

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
export class ListComponent implements OnInit {
  pokeApiService = inject(PokeApiService);
  changeDetectorRef = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);

  offset = new BehaviorSubject(0);
  end = false;

  protected readonly CARD_HEIGHT_PX = CARD_HEIGHT_PX;
  protected readonly DEFAULT_PATH = DEFAULT_PATH;

  offset$ = this.offset.pipe(
    concatMap((offset) => {
      return this.pokeApiService.getPokemons$({offset, limit: PAGINATION_PARAMS_LIMIT});
    }),
    tap(({count}) => {
      this.end = this.offset.value >= count;
    }),
    share()
  );

  pokedex$ = this.offset$.pipe(
    switchMap(({results}) => {
      return results.map(pokemon => pokemon.name);
    }),
    mergeMap(name => this.pokeApiService.getPokemonByNameOrId$(name)),
    scan<PokemonExtended, Record<string, PokemonExtended | undefined>>((acc, pokemon) => {
      acc[pokemon.name] = pokemon;
      return acc;
    }, {}),
  );

  pokemons$ = this.offset$.pipe(
    scan<NamedAPIResourceList, NamedAPIResource[]>((acc, {results}) => {
      return [...acc, ...results];
    }, []),
    startWith<NamedAPIResource[]>([])
  );

  windowResize$ = fromEvent(window, "resize").pipe(
    debounceTime(WINDOWS_RESIZE_DEBOUNCE_TIME),
    map(() => this.getCardsPerRow()),
    distinctUntilChanged(),
    startWith(this.getCardsPerRow())
  );

  chunkedPokemons$ = combineLatest([this.pokemons$, this.windowResize$]).pipe(
    map(([pokemons, cardsPerRow]) => {
      // TODO: chunk result only and merge instead
      return pokemons.reduce<NamedAPIResource[][]>((acc, curr, index) => {
        if (index % cardsPerRow === 0) acc.push([curr]);
        else acc[acc.length - 1].push(curr);
        return acc;
      }, []);
    })
  );

  @ViewChild(CdkVirtualScrollViewport)
  cdkVirtualScrollViewport!: CdkVirtualScrollViewport;

  ngOnInit(): void {
    this.windowResize$.pipe(
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

  getCardsPerRow(): number {
    const cardsPerRow = Math.floor(window.innerWidth / CARD_WIDTH_PX) || 1;
    return Math.floor((window.innerWidth - (cardsPerRow * CARD_GAP_PX)) / CARD_WIDTH_PX) || 1;
  }

  trackByIndex = (index: number): number => index;
}

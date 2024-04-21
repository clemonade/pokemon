import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit
} from "@angular/core";
import {MatButton, MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule, ValidatorFn} from "@angular/forms";
import {catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap} from "rxjs";
import {DEFAULT_PATH, SEARCH_DEBOUNCE_TIME, WHITESPACE_REG_EXP} from "../../../core/constants/app";
import {PokeApiService} from "../../../core/services/poke-api.service";
import {PokemonExtended} from "../../../core/models/pokemon";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {CardComponent} from "../card/card.component";
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {RouterLink} from "@angular/router";
import {MatProgressBar} from "@angular/material/progress-bar";
import {SEARCH_REG_EXP} from "../../../core/constants/pokemon";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [
    MatFabButton,
    MatIcon
  ],
  template: `
    <div class="fixed bottom-4 right-4 z-50">
      <button mat-fab (click)="openSearchDialog()">
        <mat-icon fontIcon="search"></mat-icon>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnDestroy {
  matDialog = inject(MatDialog);

  ngOnDestroy(): void {
    this.matDialog.closeAll();
  }

  openSearchDialog(): void {
    this.matDialog.open(SearchDialogComponent);
  }
}

@Component({
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    CardComponent,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatError,
    RouterLink,
    MatDialogClose,
    MatButton,
    MatDialogActions,
    MatProgressBar
  ],
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDialogComponent implements OnInit {
  pokeApiService = inject(PokeApiService);
  changeDetectorRef = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);

  searchValidator: ValidatorFn = (value) => {
    return value.value
      ? !SEARCH_REG_EXP.test(value.value) ? {[this.FORMAT_ERROR_CODE]: true} : null
      : null;
  };

  formControl = new FormControl("", {
    validators: [this.searchValidator],
    nonNullable: true
  });

  pokemon?: PokemonExtended;
  loading = false;

  protected readonly FORMAT_ERROR_CODE = "format";
  protected readonly POKEMON_ERROR_CODE = "pokemon";
  protected readonly DEFAULT_PATH = DEFAULT_PATH;

  formControlValueChanges$ = this.formControl.valueChanges.pipe(
    debounceTime(SEARCH_DEBOUNCE_TIME),
    filter(() => !!this.formControl.value && this.formControl.valid),
    // transform to valid params
    map((value) => {
      const handleNumber = (val: string): string => !isNaN(+val)
        ? (+val).toString()
        : val.trim().toLowerCase().replace(WHITESPACE_REG_EXP, "-");
      return value.startsWith("#") ? handleNumber(value.slice(1)) : handleNumber(value);
    }),
    distinctUntilChanged(),
    tap(() => {
      this.loading = true;
      this.changeDetectorRef.markForCheck();
    }),
    switchMap((value) => this.pokeApiService.getPokemonByNameOrId$(value, {loading: true, error: true}).pipe(
      catchError(() => {
        this.formControl.setErrors({[this.POKEMON_ERROR_CODE]: true});
        return of(undefined);
      })
    )),
    tap((pokemon) => {
      this.pokemon = pokemon;
      this.loading = false;
    }),
  );

  ngOnInit(): void {
    this.formControlValueChanges$.pipe(
      tap(() => {
        this.changeDetectorRef.markForCheck();
      }),
      takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy} from "@angular/core";
import {MatButton, MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogTitle} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule, ValidatorFn} from "@angular/forms";
import {catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap} from "rxjs";
import {DEFAULT_PATH, SEARCH_DEBOUNCE_TIME, WHITESPACE_REG_EXP} from "../../../core/constants/app";
import {PokeApiService} from "../../../core/services/poke-api.service";
import {CardComponent} from "../card/card.component";
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatProgressBar} from "@angular/material/progress-bar";
import {SEARCH_REG_EXP} from "../../../core/constants/pokemon";
import {AsyncPipe} from "@angular/common";

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
    MatDialogTitle,
    CardComponent,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatError,
    MatDialogClose,
    MatButton,
    MatDialogActions,
    MatProgressBar,
    AsyncPipe
  ],
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDialogComponent {
  pokeApiService = inject(PokeApiService);
  changeDetectorRef = inject(ChangeDetectorRef);

  searchValidator: ValidatorFn = (value) => {
    return value.value
      ? !SEARCH_REG_EXP.test(value.value) ? {[this.FORMAT_ERROR_CODE]: true} : null
      : null;
  };

  formControl = new FormControl("", {
    validators: [this.searchValidator],
    nonNullable: true
  });

  loading = false;

  protected readonly FORMAT_ERROR_CODE = "format";
  protected readonly POKEMON_ERROR_CODE = "pokemon";
  protected readonly DEFAULT_PATH = DEFAULT_PATH;

  pokemon$ = this.formControl.valueChanges.pipe(
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
    tap(() => this.loading = false),
  );
}

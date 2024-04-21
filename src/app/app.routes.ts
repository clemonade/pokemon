import {Routes} from "@angular/router";
import {ListComponent} from "./features/list/list.component";
import {DetailComponent} from "./features/detail/detail.component";
import {pokemonResolver} from "./core/resolvers/pokemon.resolver";
import {
  DEFAULT_PATH,
  DETAIL_ROUTE_PARAM,
  DEFAULT_ERROR_MESSAGE,
  ERROR_PATH,
  NAVIGATE_STATE_ERROR_MESSAGE
} from "./core/constants/app";
import {ErrorComponent} from "./core/components/error/error.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: DEFAULT_PATH,
    pathMatch: "full"
  },
  {
    path: DEFAULT_PATH,
    component: ListComponent
  },
  {
    path: `${DEFAULT_PATH}/:${DETAIL_ROUTE_PARAM}`,
    resolve: {
      pokemon: pokemonResolver
    },
    component: DetailComponent
  },
  {
    path: ERROR_PATH,
    component: ErrorComponent,
    resolve: {
      [NAVIGATE_STATE_ERROR_MESSAGE]: () => DEFAULT_ERROR_MESSAGE,
    }
  },
  {
    path: "**",
    redirectTo: ERROR_PATH,
  },
];

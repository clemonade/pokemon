import {Routes} from "@angular/router";
import {pokemonResolver} from "./core/resolvers/pokemon.resolver";
import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_PATH,
  DETAIL_ROUTE_PARAM,
  ERROR_PATH,
  NAVIGATE_STATE_ERROR_MESSAGE
} from "./core/constants/app";

export const routes: Routes = [
  {
    path: "",
    redirectTo: DEFAULT_PATH,
    pathMatch: "full"
  },
  {
    path: DEFAULT_PATH,
    loadComponent: () => import("./features/list/list.component").then(mod => mod.ListComponent)
  },
  {
    path: `${DEFAULT_PATH}/:${DETAIL_ROUTE_PARAM}`,
    resolve: {
      pokemon: pokemonResolver
    },
    loadComponent: () => import("./features/detail/detail.component").then(mod => mod.DetailComponent)
  },
  {
    path: ERROR_PATH,
    resolve: {
      [NAVIGATE_STATE_ERROR_MESSAGE]: () => DEFAULT_ERROR_MESSAGE,
    },
    loadComponent: () => import("./core/components/error/error.component").then(mod => mod.ErrorComponent)
  },
  {
    path: "**",
    redirectTo: ERROR_PATH,
  },
];

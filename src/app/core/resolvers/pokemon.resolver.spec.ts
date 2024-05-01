import {TestBed} from "@angular/core/testing";
import {ResolveFn} from "@angular/router";

import {pokemonResolver} from "./pokemon.resolver";
import {PokemonExtended} from "../models/pokemon";

describe("pokemonResolver", () => {
  const executeResolver: ResolveFn<PokemonExtended> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => pokemonResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeResolver).toBeTruthy();
  });
});

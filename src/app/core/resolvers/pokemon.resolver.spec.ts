import { TestBed } from "@angular/core/testing";
import { ResolveFn } from "@angular/router";

import { pokemonResolver } from "./pokemon.resolver";

describe("pokemonResolver", () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => pokemonResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeResolver).toBeTruthy();
  });
});

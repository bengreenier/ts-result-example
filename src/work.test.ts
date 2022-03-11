import { BaseError, ForceFailError } from "./errors";
import {
  forceFailMap,
  loadPokemon,
  loadPokemonSpecies,
  PokemonSpecies,
  prefixSpeciesName,
} from "./work";

// you can see this run with `npm run test`.

describe("work", () => {
  beforeEach(() => {
    // turn off failures - so nothing fails
    forceFailMap.set("loadPokemon", false);
    forceFailMap.set("loadPokemonSpecies", false);
    forceFailMap.set("extractSpeciesNames", false);
    forceFailMap.set("prefixSpeciesName", false);
  });

  it("should work as expected", async () => {
    // so if we just run, we get the response from the server. currently this always has 122 elements
    await expect(loadPokemon()).resolves.toHaveLength(122);

    // let's make the inner species load fail
    forceFailMap.set("loadPokemonSpecies", true);

    // now loadPokemon completes to a rejected promise, with the error
    // that's because the call it made to it's dep loadPokemonSpecies threw
    // and the error was implicitly thrown by loadPokemon as well
    await expect(loadPokemon()).rejects.toThrowError(
      "Failure forced for loadPokemonSpecies"
    );

    // let's let that succeed again, but break the name extractor
    forceFailMap.set("loadPokemonSpecies", false);
    forceFailMap.set("extractSpeciesNames", true);

    // now loadPokemon completes to a rejected promise, but with a different inner error
    await expect(loadPokemon()).rejects.toThrowError(
      "Failure forced for extractSpeciesNames"
    );

    // ok and for completeness let's do the last inner-most one
    forceFailMap.set("extractSpeciesNames", false);
    forceFailMap.set("prefixSpeciesName", true);

    // now loadPokemon completes to a rejected promise, but with a different inner error
    await expect(loadPokemon()).rejects.toThrowError(
      "Failure forced for prefixSpeciesName"
    );

    // so we're just using promises built in rejection state to represent failures.
    // that's all well and good, and it saves us having to check for downstream errors when
    // we're in an async context - you'll notice loadPokemon doesn't have any explicit logic
    // to confirm the downstream functions worked, because it only cares about the happy path.
    // But that  doesn't speak to non-async contexts yet nor handling child error contexts when
    // we do care _how_ they failed. So uh, let's do that too
  });

  it("should demonstrate how to handle error in non-async contexts", async () => {
    // let's make prefixSpeciesName fail, it's non-async
    forceFailMap.set("prefixSpeciesName", true);

    /**
     * It just throws. And we can catch that with a try-catch block
     * here we use some jest syntax to do that for us under the hood
     * It's just this though:
     *
     * try {
     *  prefixSpeciesName("whatever")
     * } catch (e) {
     *  if (e instanceof Error) {
     *    // check `e.message == <desiredMessageString>`
     *  }
     * }
     */
    expect(() => {
      prefixSpeciesName("whatever");
    }).toThrowError("Failure forced for prefixSpeciesName");

    // let's reset prefixSpeciesName and swap to loadPokemonSpecies
    forceFailMap.set("prefixSpeciesName", false);
    forceFailMap.set("loadPokemonSpecies", true);

    // and now let's pretend we care about executing a different branch when it fails
    //
    // so we'll declare the result outside the try-catch block so we can use it
    // regardless of which branch (throw or not) our execution takes
    let result: PokemonSpecies;
    try {
      // even though loadPokemonSpecies is an async function, we're in an async context
      // so we can use a try-catch block around the await callsite and handle the promise rejection
      // which will automatically be raised an an error for us here
      result = await loadPokemonSpecies(
        "not-real-url.bengreenier.com/does-not-exist"
      );
    } catch (e) {
      if (e instanceof ForceFailError) {
        // when we get this type of error, we know it's ok to proceed
        // maybe it only fails for a certain pokemon, so we know how to fill result
        result = {
          name: "pikachu",
          base_happiness: 100,
          capture_rate: 0,
        };
      } else {
        // just rethrow, maybe someone above us knows what this error is
        throw e;
      }
    }

    // and we can go right on using result, sweet
    expect(result.name).toBe("pikachu");

    // and for completeness, the final case is how to handle an async error in a sync context
    //
    // so we can do that too, with the caveat that we can't actually (safely) block sync work
    // while the async work proceeds, but we can chain additional work to run afterward
  });

  it("should demonstate how to handle async errors in a sync context", (cb) => {
    // make the species load fail again
    forceFailMap.set("loadPokemonSpecies", true);

    // start the async work
    loadPokemonSpecies("not-real-url.bengreenier.com/does-not-exist")
      .then((species) => {
        // additional work using species
        // this work only runs if the promise succeeds
        // so for our test here, it'll be skipped
        console.log("i didn't run");
      })
      .catch((err) => {
        if (err instanceof BaseError) {
          expect(err.message).toBe("Failure forced for loadPokemonSpecies");
        }
      })
      .then(() => {
        // additional work, but no access to species
        // this work always runs, cause we catch before it
        console.log("i ran last");

        // this is just us signalling to jest that the test is over
        cb();
      });

    // if we put code here, in the sync context, it would run first
    // but we probably wouldn't really do this cause it's usually a bug
    // we can't really block on async work in js, only upgrade the current scope to async
    // which looks like the chained then() calls above
    //
    // so. this isn't very realistic, but included anyway
    console.log("i run first");
  });
});

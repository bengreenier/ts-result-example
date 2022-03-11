# ts-result-example

An example of how one might handle operation success or failure in node, for async and sync workloads. Using TypeScript. 🥳

## Getting started

> You need node and npm!

- `npm i` to install deps
- `npm run build && npm run start` to see the happy path execute
- `npm run test` to see the tests run

You probably want to read the source more than actually run stuff though, so here's an overview.

`work.ts` defines some functions that download and parse pokemon species information. First we load all the species without a gender, then for each one we load their species data. We then get the name from that data, and prefix it with the string literal `species:`, like `species:magnemite`.

- `loadPokemon` is the entrypoint, and is async, meaning it returns a `Promise`. When things are working great, this promise will resolve to an array of string literals. When things goes wrong, it rejects. This concept of completion being successful or not is baked into `Promise`, we're just using it here, not inventing it.

- `loadPokemonSpecies` is called from within `loadPokemon` to get the species data for each of the pokemon. It's also async and also returns a `Promise`. This contains the specific info for the species.

- `extractSpeciesNames` is called from within `loadPokemon` to take just the names from the specific info for each species. It's sync, meaning it doesn't return a promise. It returns an array of strings.

- `prefixSpeciesName` is called last from within `loadPokemon` for each species name. It's sync, and just appends the literal `species:` to each name it's invoked with, returning the result.

`work.ts` also includes a `forceFailMap`. This is just a quick hack to make any of these functions throw an error rather then operating as designed. We can use this to simulate different failure modes in tests. For example, if we set `prefixSpeciesName` to `true` in the map, the function `prefixSpeciesName` will fail when it's called, throwing a `ForceFailError`.

It's worth noting that `work.ts` doesn't have any specific instances of handling downstream function failures. That is, `loadPokemon` doesn't handle errors thrown by `loadPokemonSpecies` explicitly, and so on. Instead, errors are allowed to propagate implicitly. In `work.test.ts` we explicitly demonstrate what it would look like to instead handle a downstream failure, catching the error and recovering. This'll probably feel really similar to other languages where you can `try-catch`, just with a few extra gotchas for async contexts.

If you've read this far, take a look at `work.ts` before hoping over to the tests in `work.test.ts` - they're really well commented, so that should take you through the rest of this stuff! Hope it helps!

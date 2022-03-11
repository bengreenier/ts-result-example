import { BaseError } from "./errors";
import { loadPokemon } from "./work";

loadPokemon().then(
  (pokemon) => {
    // this runs when things work properly
    console.log(`Enumerated pokemon. Got ${JSON.stringify(pokemon, null, 2)}`);
  },
  (err) => {
    // top level error handler
    // this would get invoked if anything in loadPokemon or it's downstream steps fail
    if (err instanceof BaseError) {
      // we could serialize the error type we care about however we want
      console.error(`Failure! Got ${err.message}`);
    } else {
      // and serialize unknown errors differently
      console.error(`Unsupported failure! Got ${err}`);
    }
  }
);

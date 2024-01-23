import { component$, useSignal, useStore, useTask$ } from "@builder.io/qwik";

export default component$(() => {
  const countriesStore = useStore<{ countries: Country[] }>({ countries: [] });
  const countryToGuess = useSignal("");

  type Country = {
    flags: {
      png: string;
      svg: string;
    };
    name: {
      common: string;
      official: string;
    };
    independent: boolean;
    currencies: {
      [key: string]: {
        name: string;
        symbol: string;
      };
    };
    region: string;
    subregion: string;
    landlocked: boolean;
    area: number;
    population: number;
  };

  useTask$(async ({ cleanup }) => {
    const abortController = new AbortController();
    cleanup(() => abortController.abort("cleanup"));
    const countries = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,population,capitals,currencies,independent,landlocked,area",
      {
        signal: abortController.signal,
      }
    );

    const data = await countries.json();

    countriesStore.countries = data as Country[];
  });

  return (
    <>
      <div>
        {countriesStore.countries.map((country) => {
          return (
            <div>
              <img src={country.flags.png} width="50" height="50" />
              {country.name.common}
            </div>
          );
        })}
      </div>
    </>
  );
});

import { component$, useStore, useTask$, $ } from "@builder.io/qwik";

export default component$(() => {
  const countriesStore = useStore<{
    countries: Country[];
    countryToGuess: Country | undefined;
  }>({ countries: [], countryToGuess: undefined });

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

  const setNewCountryToGuess = $((excludedCountryCommonName: string) => {
    const countries = countriesStore.countries.filter(
      (country) => country.name.common !== excludedCountryCommonName
    );

    const randomCountry =
      countries[Math.floor(Math.random() * countries.length)];

    countriesStore.countryToGuess = randomCountry;
  });

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
    setNewCountryToGuess("");
  });

  return (
    <>
      <div>
        {countriesStore.countryToGuess &&
          countriesStore.countryToGuess.name.common}
      </div>
    </>
  );
});

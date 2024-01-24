import { component$, useStore, useTask$, $, QRL } from "@builder.io/qwik";

type Country = {
  capital: string[];
  languages: {
    [key: string]: string;
  };
  borders: string[];
  flags: {
    png: string;
    svg: string;
  };
  flag: string;
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

export default component$(() => {
  const countriesStore = useStore<{
    countries: Country[];
    filteredCountries: Country[];
    countryToGuess: Country | undefined;
    showedClues: (keyof Country)[];
  }>({
    countries: [],
    countryToGuess: undefined,
    showedClues: [],
    filteredCountries: [],
  });

  const setNewCountryToGuess = $((excludedCountryCommonName: string) => {
    const countries = countriesStore.countries.filter(
      (country) => country.name.common !== excludedCountryCommonName
    );

    const randomCountry =
      countries[Math.floor(Math.random() * countries.length)];

    countriesStore.countryToGuess = randomCountry;
  });

  const showNextClue = () => {
    const cluesInOrder: (keyof Country)[] = [
      "area",
      "population",
      "independent",
      "landlocked",
      "borders",
      "region",
      "languages",
      "capital",
      "flags",
    ];

    const shCl = countriesStore.showedClues;
    if (shCl.length === cluesInOrder.length) {
      return;
    }
    shCl.push(cluesInOrder[shCl.length]);
  };

  useTask$(async ({ cleanup }) => {
    const abortController = new AbortController();
    cleanup(() => abortController.abort("cleanup"));
    const countries = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,population,capitals,currencies,independent,landlocked,area,capital,languages",
      {
        signal: abortController.signal,
      }
    );

    const data = await countries.json();

    countriesStore.countries = data as Country[];
    countriesStore.filteredCountries = data as Country[];
    setNewCountryToGuess("");
  });

  const filterCountryList = $((search: string) => {
    countriesStore.filteredCountries = countriesStore.countries.filter(
      (country) =>
        country.name.common.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <h3 class="text-center text-4xl uppercase font-bold tracking-widest mb-12">
        Countrdle
      </h3>
      <div class="flex justify-center">
        <CountryGuessArea
          countryFilteredList={countriesStore.filteredCountries}
          filterSearchCountries={filterCountryList}
          searchQuery=""
        />
      </div>
      <div>
        <span>The size of the country is: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("area")
            ? countriesStore.countryToGuess?.area
            : "?"}
        </span>
      </div>
      <div>
        <span>The population of the country is: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("population")
            ? countriesStore.countryToGuess?.population
            : "?"}
        </span>
      </div>
      <div>
        <span>Is the country independent: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("independent")
            ? countriesStore.countryToGuess?.independent
            : "?"}
        </span>
      </div>
      <div>
        <span>Is country landblocked: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("landlocked")
            ? countriesStore.countryToGuess?.landlocked
            : "?"}
        </span>
      </div>
      <div>
        <span>Country borders with: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("borders")
            ? countriesStore.countryToGuess?.borders.join(", ")
            : "?"}
        </span>
      </div>
      <div>
        <span>Country region: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("region")
            ? countriesStore.countryToGuess?.region
            : "?"}
        </span>
      </div>
      <div>
        <span>Country languages: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("languages") &&
          countriesStore.countryToGuess?.languages
            ? Object.values(countriesStore.countryToGuess.languages).join(", ")
            : "?"}
        </span>
      </div>
      <div>
        <span>Country capital: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("capital")
            ? countriesStore.countryToGuess?.capital
            : "?"}
        </span>
      </div>
      <div>
        <span>Country flag: </span>

        {countriesStore.showedClues.includes("flags") ? (
          <img
            src={countriesStore.countryToGuess?.flags.png}
            alt="Country flag"
            width={450}
            height={300}
          />
        ) : (
          <div class="w-[450px] h-[300px] rounded-sm bg-slate-300"></div>
        )}
      </div>
    </>
  );
});

type CountryGuessAreaProps = {
  countryFilteredList: Country[];
  searchQuery: string;
  filterSearchCountries: QRL<(search: string) => void>;
};

export const CountryGuessArea = component$(
  ({
    searchQuery,
    countryFilteredList,
    filterSearchCountries,
  }: CountryGuessAreaProps) => {
    return (
      <div>
        <input
          type="text"
          value={searchQuery}
          onInput$={(e) => {
            const value = (e.target as HTMLInputElement).value;
            if (typeof value === "string") {
              filterSearchCountries(value);
            }
          }}
          class="min-w-80 p-2 border-[1px] shadow-md border-solid border-slate-700 bg-slate-100 rounded-2xl"
        />
        <div class="flex flex-col">
          {countryFilteredList.map((country) => {
            return (
              <button
                key={country.name.official}
                type="button"
                class="w-full px-2 py-2"
              >
                {country.flag} {country.name.common}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

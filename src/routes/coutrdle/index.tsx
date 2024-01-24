import {
  component$,
  useStore,
  useTask$,
  $,
  QRL,
  useSignal,
} from "@builder.io/qwik";

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

  const filterCountryList = $((search: string) => {
    countriesStore.filteredCountries = countriesStore.countries
      .filter((country) =>
        country.name.common.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        return a.name.common.localeCompare(b.name.common);
      });
  });

  useTask$(async ({ cleanup }) => {
    const abortController = new AbortController();
    cleanup(() => abortController.abort("cleanup"));
    const countries = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,population,capitals,currencies,independent,landlocked,area,capital,languages,flag",
      {
        signal: abortController.signal,
      }
    );

    const data = await countries.json();

    countriesStore.countries = data as Country[];
    filterCountryList("");
    setNewCountryToGuess("");
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
  filterSearchCountries: QRL<(search: string) => void>;
};

export const CountryGuessArea = component$(
  ({ countryFilteredList, filterSearchCountries }: CountryGuessAreaProps) => {
    const searchQuery = useSignal("");

    return (
      <div class="relative group">
        <div class="flex gap-1 relative">
          <input
            type="text"
            value={searchQuery.value}
            onInput$={(e) => {
              const value = (e.target as HTMLInputElement).value;
              if (typeof value === "string") {
                filterSearchCountries(value);
              }
            }}
            class="min-w-80 p-2 border-[1px] shadow-md border-solid border-slate-700 bg-slate-100 rounded-md outline-none focus:border-blue-400 duration-100"
          />
          <button
            type="button"
            class="rounded-lg p-2 bg-slate-200 hover:bg-blue-200 duration-100 h-full grid place-content-center border-[1px] border-black border-solid"
          >
            <iconify-icon
              icon="mynaui:send"
              class="text-3xl text-black"
            ></iconify-icon>
          </button>
        </div>
        <div
          class="flex flex-col absolute left-1/2 top-12 -translate-x-1/2 w-full duration-150 opacity-0
         pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto
         bg-slate-50 rounded-md"
        >
          {[...countryFilteredList].splice(0, 8).map((country) => {
            return (
              <button
                key={country.name.official}
                type="button"
                class="w-full px-2 py-2 hover:bg-slate-200 rounded-md duration-100 overflow-hidden text-ellipsis whitespace-nowrap"
                onClick$={() => {
                  searchQuery.value = country.name.common;
                  filterSearchCountries(country.name.common);
                }}
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

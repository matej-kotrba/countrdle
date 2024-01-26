import {
  component$,
  useStore,
  useTask$,
  $,
  type QRL,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";

import styles from "./styles.css";
import Box from "~/components/containers/Box";

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
  latlng: {
    0: number;
    1: number;
  };
};

export default component$(() => {
  // @ts-ignore
  useStylesScoped$(styles);
  const countriesStore = useStore<{
    countries: Country[];
    filteredCountries: Country[];
    countryToGuess: Country | undefined;
    showedClues: (keyof Country)[];
    guessedCountries: Country[];
  }>({
    countries: [],
    countryToGuess: undefined,
    showedClues: ["area"],
    filteredCountries: [],
    guessedCountries: [],
  });

  const setNewCountryToGuess = $((excludedCountryCommonName: string) => {
    const countries = countriesStore.countries.filter(
      (country) => country.name.common !== excludedCountryCommonName
    );

    const randomCountry =
      countries[Math.floor(Math.random() * countries.length)];

    countriesStore.countryToGuess = randomCountry;
  });

  const showNextClue = $(() => {
    const cluesInOrder: (keyof Country)[] = [
      "area",
      "population",
      "landlocked",
      "region",
      "languages",
      "capital",
      "borders",
      "flags",
    ];

    const shCl = countriesStore.showedClues;
    if (shCl.length === cluesInOrder.length) {
      return;
    }
    shCl.push(cluesInOrder[shCl.length]);
  });

  const filterCountryList = $((search: string) => {
    const guessedCountriesNames = countriesStore.guessedCountries.map(
      (country) => country.name.common
    );

    countriesStore.filteredCountries = countriesStore.countries
      .filter((country) => !guessedCountriesNames.includes(country.name.common))
      .filter((country) =>
        country.name.common.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        return a.name.common.localeCompare(b.name.common);
      });
  });

  const isCountryGuessed = $((country: Country) => {
    return (
      country.name.official === countriesStore.countryToGuess?.name.official
    );
  });

  const guessCountry = $(async (query: string) => {
    const usedCountriesNames = countriesStore.guessedCountries.map(
      (country) => country.name.common
    );

    const country = countriesStore.countries
      .filter((country) => !usedCountriesNames.includes(country.name.common))
      .find((item) =>
        item.name.common.toLowerCase().includes(query.toLowerCase())
      );

    if (
      !country ||
      countriesStore.guessedCountries.find(
        (item) => item.name.official === country.name.official
      )
    )
      return;

    countriesStore.guessedCountries.push(country);
    const result = await isCountryGuessed(country);
    if (result) {
      alert("You guessed the country!");
    } else {
      showNextClue();
    }
  });

  const getCountryDirection = $(
    (
      state: any,
      correctCountry: Country["latlng"],
      country: Country["latlng"]
    ) => {
      const { 0: lat1, 1: lng1 } = correctCountry;
      const { 0: lat2, 1: lng2 } = country;

      const tolerance = 4;

      // Calculate the difference and create an arrow icon depending on it
      const latDiff = lat1 - lat2;
      const lngDiff = lng1 - lng2;

      const data = {
        up: "⬆️",
        leftup: "↖️",
        rightup: "↗️",
        down: "⬇️",
        leftdown: "↙️",
        rightdown: "↘️",
        left: "⬅️",
        right: "➡️",
      };

      let isTop = false;
      let isLeft = false;
      let isTween = false;
      let nonTweenDirection: "width" | "height" = "width";

      if (lngDiff < 0) {
        isLeft = true;
      }
      if (latDiff > 0) {
        isTop = true;
      }
      if (Math.abs(latDiff) <= tolerance && Math.abs(lngDiff) <= tolerance) {
        isTween = true;
      } else if (
        Math.abs(latDiff) > tolerance &&
        Math.abs(lngDiff) > tolerance
      ) {
        isTween = true;
      } else if (Math.abs(lngDiff) > tolerance) {
        nonTweenDirection = "width";
      } else {
        nonTweenDirection = "height";
      }

      if (isTop && isLeft && isTween) {
        return data.leftup;
      }
      if (isTop && isLeft && !isTween) {
        return nonTweenDirection === "width" ? data.left : data.up;
      }
      if (isTop && !isLeft && isTween) {
        return data.rightup;
      }
      if (isTop && !isLeft && !isTween) {
        return nonTweenDirection === "width" ? data.right : data.up;
      }
      if (!isTop && isLeft && isTween) {
        return data.leftdown;
      }
      if (!isTop && isLeft && !isTween) {
        return nonTweenDirection === "width" ? data.left : data.down;
      }
      if (!isTop && !isLeft && isTween) {
        return data.rightdown;
      }
      if (!isTop && !isLeft && !isTween) {
        return nonTweenDirection === "width" ? data.right : data.down;
      }
    }
  );

  const getCountryDistance = $(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R: number = 6371.0;

      const toRadians = (degree: number) => degree * (Math.PI / 180);
      lat1 = toRadians(lat1);
      lon1 = toRadians(lon1);
      lat2 = toRadians(lat2);
      lon2 = toRadians(lon2);

      // Differences in coordinates
      const dlat: number = lat2 - lat1;
      const dlon: number = lon2 - lon1;

      // Haversine formula
      const a: number =
        Math.sin(dlat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
      const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      // Calculate the distance
      const distance: number = R * c;

      return distance.toFixed(0);
    }
  );

  useTask$(async ({ cleanup }) => {
    const abortController = new AbortController();
    cleanup(() => abortController.abort("cleanup"));
    const countries = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,region,subregion,population,capitals,currencies,independent,landlocked,area,capital,languages,flag,borders,latlng",
      {
        signal: abortController.signal,
      }
    );

    const data = await countries.json();

    countriesStore.countries = (data as Country[]).sort((a, b) => {
      return a.name.common.localeCompare(b.name.common);
    });
    filterCountryList("");
    setNewCountryToGuess("");
  });

  return (
    <>
      <h3 class="text-center text-4xl uppercase font-bold tracking-widest mb-12">
        Countrdle
      </h3>

      <div class="grid xl:grid-cols-6 2xl:grid-cols-7 gap-2">
        <Box
          title="Size"
          onHoverTitle="The size of the country in km²"
          value={
            countriesStore.showedClues.includes("area")
              ? String(countriesStore.countryToGuess?.area) + " km²"
              : "?"
          }
        >
          <iconify-icon
            icon="fluent:slide-size-24-regular"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box
          title="Population"
          onHoverTitle="The population of the country"
          value={
            countriesStore.showedClues.includes("population")
              ? String(countriesStore.countryToGuess?.population)
              : "?"
          }
        >
          <iconify-icon
            icon="ic:round-group"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box
          title="Landlocked"
          onHoverTitle="Is country landlocked?"
          value={
            countriesStore.showedClues.includes("landlocked")
              ? countriesStore.countryToGuess?.landlocked
                ? "Yes"
                : "No"
              : "?"
          }
        >
          <iconify-icon
            icon="carbon:locked"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box
          title="Region"
          onHoverTitle="Region of the country"
          value={
            countriesStore.showedClues.includes("region")
              ? countriesStore.countryToGuess?.region
              : "?"
          }
        >
          <iconify-icon
            icon="ic:round-landscape"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box
          title="Languages"
          onHoverTitle="Languages of the country"
          value={
            countriesStore.showedClues.includes("languages") &&
            countriesStore.countryToGuess?.languages
              ? Object.values(countriesStore.countryToGuess.languages).join(
                  ", "
                )
              : "?"
          }
        >
          <iconify-icon
            icon="ion:language"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box
          title="Capital"
          onHoverTitle="Capital of the country"
          value={
            countriesStore.showedClues.includes("capital")
              ? String(countriesStore.countryToGuess?.capital)
              : "?"
          }
        >
          <iconify-icon
            icon="solar:city-bold"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box
          title="Borders"
          onHoverTitle="Countries of the this country borders with"
          value={
            countriesStore.showedClues.includes("borders") &&
            countriesStore.countryToGuess?.borders
              ? countriesStore.countryToGuess.borders.length > 0
                ? countriesStore.countryToGuess.borders.join(", ")
                : "None"
              : "?"
          }
        >
          <iconify-icon
            icon="fluent:border-all-20-regular"
            slot="icon"
            class="text-8xl"
          ></iconify-icon>
        </Box>
        <Box title="Country flag" onHoverTitle="Flag of the country" value={""}>
          {countriesStore.showedClues.includes("flags") ? (
            <img
              src={countriesStore.countryToGuess?.flags.png}
              alt="Country flag"
              width={450}
              height={300}
            />
          ) : (
            <div class="w-full aspect-square rounded-sm bg-slate-300"></div>
          )}
        </Box>
      </div>
      {/* <div>
        <span>The size of the country is: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("area")
            ? countriesStore.countryToGuess?.area
            : "?"}
        </span>
        <span> km2</span>
      </div> */}
      {/* <div>
        <span>The population of the country is: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("population")
            ? countriesStore.countryToGuess?.population
            : "?"}
        </span>
      </div> */}
      {/* <div>
        <span>Is country landlocked: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("landlocked")
            ? countriesStore.countryToGuess?.landlocked
              ? "Yes"
              : "No"
            : "?"}
        </span>
      </div> */}
      {/* <div>
        <span>Country region: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("region")
            ? countriesStore.countryToGuess?.region
            : "?"}
        </span>
      </div> */}
      {/* <div>
        <span>Country languages: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("languages") &&
          countriesStore.countryToGuess?.languages
            ? Object.values(countriesStore.countryToGuess.languages).join(", ")
            : "?"}
        </span>
      </div> */}
      {/* <div>
        <span>Country capital: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("capital")
            ? countriesStore.countryToGuess?.capital
            : "?"}
        </span>
      </div> */}
      {/* <div>
        <span>Country borders with: </span>
        <span class="font-bold text-xl">
          {countriesStore.showedClues.includes("borders")
            ? countriesStore.countryToGuess?.borders.join(", ")
            : "?"}
        </span>
      </div> */}
      {/* <div>
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
      </div> */}
      <div class="flex flex-col items-center max-w-96 mx-auto mt-2">
        <CountryGuessArea
          countryFilteredList={countriesStore.filteredCountries}
          filterSearchCountries={filterCountryList}
          onSubmit={guessCountry}
        />
        <div class="flex flex-col gap-1 w-full mt-2">
          {countriesStore.guessedCountries.map((country) => {
            return (
              <div
                key={country.name.common}
                class="grid w-full text-lg py-2 bg-slate-100 rounded-md text-center gird__container px-2"
              >
                <span class="text-left">
                  {country.flag} {country.name.common}{" "}
                </span>
                <span class="text-left">
                  {countriesStore.countryToGuess
                    ? getCountryDirection(
                        country,
                        countriesStore.countryToGuess.latlng,
                        country.latlng
                      )
                    : ""}
                  {countriesStore.countryToGuess
                    ? getCountryDistance(
                        countriesStore.countryToGuess.latlng[0],
                        countriesStore.countryToGuess.latlng[1],
                        country.latlng[0],
                        country.latlng[1]
                      )
                    : ""}{" "}
                  km
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

type CountryGuessAreaProps = {
  countryFilteredList: Country[];
  filterSearchCountries: QRL<(search: string) => void>;
  onSubmit: QRL<(query: string) => void>;
};

export const CountryGuessArea = component$(
  ({
    countryFilteredList,
    filterSearchCountries,
    onSubmit,
  }: CountryGuessAreaProps) => {
    const searchQuery = useSignal("");
    const hideDropdown = useSignal(true);
    const arrowSelectedCountry = useSignal(0);

    return (
      <div class="relative group w-full">
        <div
          class="flex gap-1 relative"
          onClick$={() => {
            hideDropdown.value = false;
          }}
        >
          <input
            type="text"
            value={searchQuery.value}
            onKeyDown$={(e) => {
              if (e.key === "Enter") {
                hideDropdown.value = true;
                onSubmit(searchQuery.value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
            onInput$={(e) => {
              hideDropdown.value = false;
              const value = (e.target as HTMLInputElement).value;
              if (typeof value === "string") {
                searchQuery.value = value;
                filterSearchCountries(value);
              }
            }}
            class="w-full p-2 border-[1px] shadow-md border-solid border-slate-700 bg-slate-100 rounded-md outline-none focus:border-blue-400 duration-100"
          />
          <button
            type="button"
            class="rounded-lg p-2 bg-slate-200 hover:bg-blue-200 duration-100 h-full grid place-content-center border-[1px] border-black border-solid"
            onClick$={(e) => {
              hideDropdown.value = true;
              onSubmit(searchQuery.value);
              (e.target as HTMLInputElement).value = "";
              e.stopPropagation();
            }}
          >
            <iconify-icon
              icon="mynaui:send"
              class="text-3xl text-black"
            ></iconify-icon>
          </button>
        </div>
        <div
          class={`flex flex-col absolute left-1/2 top-12 -translate-x-1/2 w-full duration-150 opacity-0
         pointer-events-none ${hideDropdown.value ? "" : "group-focus-within:opacity-100 group-focus-within:pointer-events-auto"}
         bg-slate-50 rounded-md`}
        >
          {[...countryFilteredList].splice(0, 8).map((country) => {
            return (
              <button
                key={country.name.official}
                type="button"
                class="w-full px-2 py-2 hover:bg-slate-200 rounded-md duration-100 overflow-hidden text-ellipsis whitespace-nowrap"
                onClick$={(e) => {
                  searchQuery.value = country.name.common;
                  filterSearchCountries(country.name.common);
                }}
              >
                {country.flag} {country.name.common}{" "}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

import {
  type QRL,
  component$,
  useSignal,
  useStylesScoped$,
} from "@builder.io/qwik";
import CoverCSS from "./cover.css";

type Props = {
  show: boolean;
  tryCount: number;
  countryName: string;
  onRestart: QRL<() => void>;
};

export default component$(
  ({ show, tryCount, countryName, onRestart }: Props) => {
    //@ts-ignore
    useStylesScoped$(CoverCSS);

    const dialogRef = useSignal<HTMLDivElement>();

    return (
      <div
        ref={dialogRef}
        class={`dialog absolute z-[100] bg-white shadow-md left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-xl p-2 sm:p-4 flex flex-col justify-center ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <h4 class="text-3xl text-center font-semibold">
          🥳🥳 You guessed it! 🥳🥳
        </h4>
        <p class="text-center">{countryName}</p>
        <p class="text-center">In {tryCount} tries.</p>
        <button
          onClick$={onRestart}
          class="relative flex items-center gap-1 border-slate-300 border-2 border-solid p-3 group w-fit mx-auto mt-8"
        >
          <div class="line bg-blue-500 absolute left-0 top-0 w-full h-1 origin-left scale-x-0 group-hover:scale-x-100 duration-150"></div>
          <div class="line bg-blue-500 absolute top-0 right-0 h-full w-1 origin-top scale-y-0 group-hover:scale-y-100 duration-150 group-hover:delay-150"></div>
          <div class="line bg-blue-500 absolute left-0 bottom-0 w-full h-1 origin-right scale-x-0 group-hover:scale-x-100 duration-150 group-hover:delay-300"></div>
          <div class="line bg-blue-500 absolute top-0 left-0 h-full w-1 origin-bottom scale-y-0 group-hover:scale-y-100 duration-150 group-hover:delay-[450ms]"></div>
          <span class="text-2xl">Restart</span>
          <div class="grid place-content-center">
            <iconify-icon
              icon="solar:restart-bold"
              class="text-2xl"
            ></iconify-icon>
          </div>
        </button>
      </div>
    );
  }
);

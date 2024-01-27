import { Slot, component$ } from "@builder.io/qwik";

type Props = {
  title: string;
  onHoverTitle: string;
  value: string | undefined;
};

export default component$(({ title, onHoverTitle, value }: Props) => {
  return (
    <abbr
      title={onHoverTitle}
      class="mx-auto rounded-lg no-underline grid items-center w-full h-full max-w-52 aspect-square border-2 border-black border-solid p-2"
    >
      <div class="h-fit overflow-hidden">
        <div class="grid place-content-center">
          <Slot q:slot="icon" />
        </div>
        <div>
          <h4 class="text-center font-semibold text-lg">{title}</h4>
        </div>
        <div class="w-full text-center text-md overflow-hidden text-ellipsis whitespace-nowrap">
          {value}
        </div>
      </div>
    </abbr>
  );
});

import { component$, useSignal, useTask$ } from "@builder.io/qwik";

type Props = {
  show: boolean;
  tryCount: number;
};

export default component$(({ show, tryCount }: Props) => {
  const dialogRef = useSignal<HTMLDialogElement>();

  useTask$(({ track }) => {
    track(() => show);
    show ? dialogRef.value?.showModal() : dialogRef.value?.close();
    dialogRef.value?.showModal();
  });

  return (
    <div>
      <dialog ref={dialogRef}>
        <h4>You guessed it!</h4>
        <p>In {tryCount} tries.</p>
      </dialog>
    </div>
  );
});

import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <>
      <nav class="w-full p-2 bg-slate-300">
        <div class="aspect-square w-16 rounded-full overflow-hidden">
          <img
            src="/imgs/logo.png"
            alt="Logo"
            class="object-contain w-full h-full"
          />
        </div>
      </nav>
      <main class="container mx-auto">
        <Slot />
      </main>
    </>
  );
});

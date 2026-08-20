import FederationDemo from "./FederationDemo";
import { REMOTE_ENTRY } from "./federation";

/**
 * A host page for a Module Federation remote published by another repository, on another origin.
 *
 * The page itself is static — everything federated happens in the browser, which is the point. The
 * server render contains no trace of the remote, and the component only exists after a container at
 * `REMOTE_ENTRY` answers.
 *
 * Sibling demo: /embed-demo serves the same data through the script-tag and iframe embeds. Reading
 * the two together is the argument — same data, opposite integration contracts.
 */
export const dynamic = "force-static";

export default function MicroFrontendsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Module Federation, entre duas origens
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Esta página é servida por <code className="font-mono">samuelsantana.dev</code> e monta, dentro
        da própria árvore React, um componente que vive em{" "}
        <code className="font-mono">cygnus.samuelsantana.dev</code> — repositórios diferentes, deploys
        diferentes, um único React. Nada do componente está no bundle desta página: ela carrega uma
        URL e o container do outro lado decide o que devolver.
      </p>

      <hr className="my-8" />

      <FederationDemo />

      <hr className="my-8" />

      <section className="max-w-2xl text-sm text-muted-foreground">
        <h2 className="mb-2 text-sm font-semibold tracking-tight text-foreground">
          Por que não é o mesmo que o embed
        </h2>
        <p>
          O{" "}
          {/*
            eslint-disable-next-line @next/next/no-html-link-for-pages --
            /embed-demo is a Route Handler that returns a standalone HTML document, not a page in
            the app tree. next/link would prefetch an RSC payload that does not exist and then
            navigate into a document this router does not own; a full page load is the correct
            transition here, not a worse one.
          */}
          <a className="underline" href="/embed-demo">
            embed
          </a>{" "}
          mostra estes mesmos dados por{" "}
          <code className="font-mono">&lt;script&gt;</code> e por iframe: DOM puro, shadow root,
          nenhum framework atravessando. Ele diz <em>“não confio em você e você não deveria confiar
          em mim”</em>.
        </p>
        <p className="mt-2">
          Federação diz o contrário: <em>“somos uma aplicação só, montada a partir de dois
          repositórios”</em>. O componente recebe props, devolve callbacks e usa hooks da instância de
          React <strong>desta</strong> página. Em troca, esta página passou a depender da
          disponibilidade de outra origem — o botão acima mostra o que acontece quando ela falha.
        </p>
        <p className="mt-2">
          Nenhum é a evolução do outro. Um host que não pode se comprometer com React 19 não tem o que
          fazer aqui e deve usar o iframe.
        </p>
        <p className="mt-4 font-mono text-xs break-all">
          remoteEntry: {REMOTE_ENTRY}
        </p>
      </section>
    </main>
  );
}

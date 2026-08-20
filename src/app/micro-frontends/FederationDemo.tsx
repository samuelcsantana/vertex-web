"use client";

import {
  Component,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  OFFLINE_REMOTE_NAME,
  REMOTE_ENTRY,
  REMOTE_NAME,
  initFederation,
  loadVaccineSchedule,
  probeSharing,
  type SharingReport,
} from "./federation";

/**
 * Nothing federated exists during SSR: `loadRemote` reaches for the network and for `document`.
 *
 * `useSyncExternalStore` rather than the usual `useState` + `useEffect` mounted flag — that pattern
 * is a setState in an effect body, which cascades a render and which this project's lint rules
 * reject. A store that never changes gives the same answer without the extra pass: the server
 * snapshot is `false`, the client snapshot is `true`, and React swaps them during hydration.
 */
const NEVER_CHANGES = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false
  );
}

type RemoteProps = {
  apiOrigin?: string;
  limit?: number;
  onSelect?: (item: { id: string; name: string }) => void;
};

/**
 * Carries the container it describes, so switching containers does not need a state reset.
 *
 * Resetting to `loading` at the top of the effect would be a synchronous setState in an effect body
 * — a cascading render, and one the lint rules reject. Tagging the result with its origin lets the
 * render derive the same thing for free: a result for a container nobody is asking about any more
 * is, by definition, still loading.
 */
type RemoteState =
  | { name: null; status: "loading" }
  | { name: string; status: "ready"; Component: ComponentType<RemoteProps> }
  | { name: string; status: "failed"; reason: string };

/**
 * A remote is third-party code running inside this tree, so a render error inside it would take
 * this page down with it. Suspense handles pending, not failed, and a class component is still the
 * only thing that catches a render error in React 19.
 *
 * Load failures are handled separately, as state — a container that never answered has nothing to
 * render, so there is no render to catch.
 */
class RemoteBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function RemoteFailure({ reason }: { reason: string }) {
  return (
    <div className="rounded-xl border border-dashed border-destructive/40 p-4">
      <p className="text-sm font-medium">O remote não respondeu.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        O resto desta página continua de pé — que é exatamente o motivo de um host embrulhar cada
        remote e nunca assumir que ele vai estar lá.
      </p>
      <p className="mt-2 font-mono text-[11px] break-all text-muted-foreground">{reason}</p>
    </div>
  );
}

export default function FederationDemo() {
  const isClient = useIsClient();
  const [remoteName, setRemoteName] = useState(REMOTE_NAME);
  const [loaded, setLoaded] = useState<RemoteState>({ name: null, status: "loading" });
  const [report, setReport] = useState<SharingReport | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const offline = remoteName === OFFLINE_REMOTE_NAME;

  // The component is resolved in an effect and held in state rather than through `React.lazy`.
  // `lazy` memoises its promise, so switching containers would keep showing whichever answered
  // first, and building a fresh `lazy` per container means creating a component during render.
  useEffect(() => {
    if (!isClient) return;

    let cancelled = false;

    loadVaccineSchedule(remoteName)
      .then((module) => {
        if (!cancelled) {
          setLoaded({ name: remoteName, status: "ready", Component: module.default });
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoaded({
          name: remoteName,
          status: "failed",
          reason: error instanceof Error ? error.message : "unknown",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [remoteName, isClient]);

  useEffect(() => {
    if (!isClient) return;

    initFederation();

    let cancelled = false;
    probeSharing()
      .then((result) => {
        if (!cancelled) setReport(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) setProbeError(error instanceof Error ? error.message : "unknown");
      });

    return () => {
      cancelled = true;
    };
  }, [isClient]);

  const toggleRemote = useCallback(
    () => setRemoteName((current) => (current === REMOTE_NAME ? OFFLINE_REMOTE_NAME : REMOTE_NAME)),
    []
  );

  // A result tagged with a container nobody is asking about any more is still loading.
  const remote: RemoteState = loaded.name === remoteName ? loaded : { name: null, status: "loading" };
  const RemoteComponent = remote.status === "ready" ? remote.Component : null;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-start">
      <section>
        <h2 className="mb-1 text-sm font-semibold tracking-tight">
          Carregado de outra origem, em runtime
        </h2>
        <p className="mb-4 font-mono text-xs break-all text-muted-foreground">
          {offline ? "(entry que não existe)" : REMOTE_ENTRY}
        </p>

        {!isClient ? (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground">
            O componente é resolvido no browser — nada disto existe no HTML do servidor.
          </div>
        ) : remote.status === "loading" ? (
          <div className="rounded-xl border p-4 text-sm text-muted-foreground">
            Buscando o container…
          </div>
        ) : remote.status === "failed" ? (
          <RemoteFailure reason={remote.reason} />
        ) : RemoteComponent ? (
          <RemoteBoundary
            fallback={<RemoteFailure reason="o remote falhou ao renderizar" />}
          >
            <RemoteComponent limit={6} onSelect={(item) => setSelected(item.name)} />
          </RemoteBoundary>
        ) : null}

        <p className="mt-3 text-xs text-muted-foreground">
          {selected
            ? `O remote avisou o host: "${selected}". Quem decide o que isso significa é esta página — o remote nunca navega o host.`
            : "Clique numa vacina: o remote chama um callback do host em vez de navegar."}
        </p>

        <button
          type="button"
          onClick={toggleRemote}
          className="mt-4 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          {offline ? "Restaurar o remote" : "Simular o remote fora do ar"}
        </button>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold tracking-tight">A negociação do React, medida</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Versão igual não é prova: duas cópias da mesma versão continuam sendo dois objetos.
          Identidade de referência é a única checagem que <em>falha</em> quando a negociação falha.
        </p>

        {probeError ? (
          <p className="font-mono text-xs text-destructive">{probeError}</p>
        ) : report ? (
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-xs">
            <dt className="text-muted-foreground">React do host</dt>
            <dd className="font-mono">{report.hostReactVersion}</dd>

            <dt className="text-muted-foreground">React do remote</dt>
            <dd className="font-mono">{report.remoteReactVersion}</dd>

            <dt className="text-muted-foreground">
              <code>useState</code> é a mesma função
            </dt>
            <dd className="font-mono" data-testid="shares-use-state">
              {report.sharesUseState ? "sim" : "NÃO"}
            </dd>

            <dt className="text-muted-foreground">
              <code>createElement</code> é a mesma função
            </dt>
            <dd className="font-mono" data-testid="shares-create-element">
              {report.sharesCreateElement ? "sim" : "NÃO"}
            </dd>
          </dl>
        ) : (
          <p className="text-xs text-muted-foreground">Medindo…</p>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Se estas duas linhas dissessem <strong>NÃO</strong>, o widget ainda apareceria — e quebraria
          na primeira vez que tocasse em estado ou contexto do host, várias camadas longe da causa. É
          por isso que a prova precisa ser explícita.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Aqui as versões acabam corroborando. O Next empacota o próprio build de React para o App
          Router, então o host oferece um <code className="font-mono">canary</code> enquanto o remote
          foi compilado contra 19.2.8 — o remote relatar o canary é relatar uma versão que ele não
          carrega e só poderia ter recebido.
        </p>
      </section>
    </div>
  );
}

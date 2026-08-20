/**
 * The cross-origin host page for the Cygnus embed, served as a Route Handler rather than a page.
 *
 * It started as public/embed-demo.html and 404d in production, which is worth recording because
 * the failure looks like a deploy problem and is not: Next does not serve .html files out of
 * public/ — it reserves that extension for its own output — while every other file type there is
 * served normally. og-fallback.png sitting in the same directory returning 200 is what made the
 * cause visible.
 *
 * A Route Handler is the right shape anyway. It needs no root layout (there is none outside
 * [locale]) and no translations, and it keeps the demo what it has to be to prove anything: plain
 * HTML with no framework participating in the integration.
 *
 * proxy.ts excludes this path from locale routing, since a technical demo has no localized twin.
 */
export const dynamic = "force-static";

const PAGE = `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Cygnus embed — demonstração cross-origin</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        max-width: 940px; margin: 0 auto; padding: 32px 20px 64px; line-height: 1.55;
      }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 17px; margin-top: 36px; }
      p { margin: 8px 0; }
      .lead { color: #6b7280; margin-bottom: 28px; }
      .grid { display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
      code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
      pre { background: #0d1117; color: #e6edf3; padding: 12px 14px; border-radius: 8px; overflow-x: auto; }
      .log {
        background: #0d1117; color: #7ee787; padding: 12px 14px; border-radius: 8px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
        min-height: 84px; max-height: 200px; overflow-y: auto; white-space: pre-wrap;
      }
      iframe { width: 100%; border: 0; display: block; }
      .note { border-left: 3px solid #2A9D8F; padding-left: 12px; color: #6b7280; font-size: 14px; }
    </style>
  </head>
  <body>
    <h1>Cygnus embed — demonstração cross-origin</h1>
    <p class="lead">
      Esta página é <strong>samuelsantana.dev</strong>. Os dois widgets abaixo vêm de
      <strong>cygnus.samuelsantana.dev</strong> — origem diferente, projeto diferente, deploy diferente.
      É HTML puro: nenhum framework participa da integração.
    </p>

    <div class="grid">
      <section>
        <h2>1. Script tag</h2>
        <p class="note">
          Renderiza no DOM desta página, dentro de um shadow root fechado. Integra com o layout,
          mas roda na origem do host — quem embarca precisa confiar no código.
        </p>
        <div id="via-script"></div>
        <pre>&lt;div id="vacinas"&gt;&lt;/div&gt;
&lt;script src="https://cygnus.samuelsantana.dev/embed/embed.js"
        data-target="#vacinas" defer&gt;&lt;/script&gt;</pre>
      </section>

      <section>
        <h2>2. iframe</h2>
        <p class="note">
          Documento separado, origem separada, contexto de JS separado. Em troca, não sabe se
          dimensionar sozinho — a altura abaixo vem por <code>postMessage</code>.
        </p>
        <iframe
          id="via-iframe"
          src="https://cygnus.samuelsantana.dev/embed/iframe.html?limit=6"
          title="Calendário vacinal do Cygnus"
          height="120"
          loading="lazy"
        ></iframe>
      </section>
    </div>

    <h2>Mensagens recebidas do embed</h2>
    <p class="note">
      Contrato versionado. O host filtra por <code>source</code> porque o mesmo handler recebe
      analytics, chat e devtools de framework — e por <code>version</code>, porque esta página não
      pode ser reimplantada junto com o widget.
    </p>
    <div class="log" id="log">aguardando…</div>

    <script>
      var log = document.getElementById('log');
      var frame = document.getElementById('via-iframe');
      var lines = [];

      function record(origin, message) {
        lines.unshift(
          new Date().toLocaleTimeString('pt-BR') + '  ' + origin + '  ' + JSON.stringify(message)
        );
        log.textContent = lines.slice(0, 12).join('\n');
      }

      // iframe: postMessage. The version check is the point of versioning it at all.
      window.addEventListener('message', function (event) {
        var data = event.data;
        if (!data || data.source !== 'cygnus-embed' || data.version !== 1) return;

        record('[iframe]', data);

        if (data.type === 'resize' || data.type === 'ready') {
          frame.height = data.height + 16;
        }
      });

      // script tag: same contract, DOM events instead of postMessage — the idiom an in-page host
      // already has handlers for.
      ['ready', 'resize', 'navigate', 'error'].forEach(function (type) {
        document.addEventListener('cygnus:' + type, function (event) {
          record('[script]', event.detail);

          if (type === 'navigate') {
            // The embed asked; the host decides. It never navigates this page itself.
            window.open(event.detail.url, '_blank', 'noopener');
          }
        });
      });
    </script>

    <script
      src="https://cygnus.samuelsantana.dev/embed/embed.js"
      data-target="#via-script"
      data-limit="6"
      defer
    ></script>
  </body>
</html>
`;

export function GET() {
  return new Response(PAGE, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });
}

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="container mx-auto flex max-w-[980px] flex-col items-center gap-4 py-16 text-center md:py-24 lg:py-32">
      <h1 className="bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent lg:text-5xl dark:from-neutral-100 dark:to-neutral-500">
        Arquitetura e Engenharia Frontend
      </h1>
      <p className="max-w-[750px] text-xl text-muted-foreground">
        Explorando padrões modernos, micro-frontends e performance na web.
      </p>

      <div className="mt-4 flex gap-4">
        <Button nativeButton={false} render={<Link href="/projects" />}>
          Ver Portfólio
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/blog" />}
        >
          Ler Artigos
        </Button>
      </div>
    </section>
  );
}

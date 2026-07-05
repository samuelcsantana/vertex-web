"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Sparkles, Trash2, User } from "lucide-react";

import { useBlogAdmin } from "@/components/blog-identity/blog-admin-context";

interface MockPost {
  id: string;
  title: string;
  date: string;
}

const MOCK_POSTS: MockPost[] = [
  { id: "1", title: "Arquitetura Multi-tenant", date: "2026-01-01" },
  { id: "2", title: "Engenharia dos Domínios e Convenções", date: "2026-01-01" },
  { id: "3", title: "Engenharia de Software e Tecnologia", date: "2026-01-01" },
  { id: "4", title: "Padrões em Programação de Componentes", date: "2026-01-01" },
  { id: "5", title: "Build Setup com Angular Plugin CSS", date: "2026-01-01" },
  { id: "6", title: "Roadmap para Desenvolvimento Front-end", date: "2026-01-01" },
  { id: "7", title: "Software por Argumento de Multi-tenant", date: "2026-01-01" },
  { id: "8", title: "Como Engenheiro Arquiteta & Código", date: "2026-01-01" },
];

export default function BlogPage() {
  const { isAdmin } = useBlogAdmin();

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <section className="flex flex-col items-start gap-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          Engenharia de Software,
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Arquitetura & Código.
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          samuel.dev é um blog pessoal sobre engenharia de software,
          arquitetura e código — anotações de quem constrói produtos reais no
          dia a dia.
        </p>
      </section>

      {isAdmin && (
        <div className="relative z-10 mt-10 -mb-8 flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl">
          <div>
            <p className="text-sm font-medium text-white">
              Painel de Administração Ativo
            </p>
            <Link
              href="/dashboard/posts"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-200"
            >
              <Plus className="size-3.5" />
              Novo Artigo
            </Link>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
            <User className="size-5" />
          </div>
        </div>
      )}

      <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_POSTS.map((post) => (
          <article
            key={post.id}
            className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/5"
          >
            {isAdmin && (
              <div className="mb-4 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Editar artigo"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400"
                >
                  <Pencil className="size-3.5" />
                  Editar
                </button>
                <button
                  type="button"
                  aria-label="Excluir artigo"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                  Excluir
                </button>
              </div>
            )}

            <h2 className="text-lg font-bold text-slate-100 transition-colors group-hover:text-emerald-400">
              {post.title}
            </h2>

            <time dateTime={post.date} className="mt-2 block text-sm text-slate-500">
              {format(parseISO(post.date), "MMMM d, yyyy")}
            </time>
          </article>
        ))}
      </section>

      <Sparkles className="pointer-events-none absolute right-8 bottom-8 size-6 text-slate-700" />
    </div>
  );
}

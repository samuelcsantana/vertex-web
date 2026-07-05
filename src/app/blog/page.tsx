"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Shield, Sparkles, Trash2, User } from "lucide-react";

import { LoginModal } from "./_components/LoginModal";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="relative dark:bg-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[480px] rounded-full blur-[120px] dark:bg-emerald-900/20" />
        <div className="absolute top-1/3 right-0 size-[480px] rounded-full blur-[120px] dark:bg-cyan-900/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 dark:text-slate-300">
        <div className="mb-8 flex justify-end">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className="rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Sair (demo)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.5)] transition-transform hover:scale-[1.03]"
            >
              <Shield className="size-4" />
              Login (Mock)
            </button>
          )}
        </div>

        <section className="flex flex-col items-start gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl dark:text-white">
            Engenharia de Software,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Arquitetura & Código.
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            samuel.dev é um blog pessoal sobre engenharia de software,
            arquitetura e código — anotações de quem constrói produtos reais
            no dia a dia.
          </p>
        </section>

        {isAdmin && (
          <div className="relative z-10 mt-10 -mb-8 flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Painel de Administração Ativo
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Plus className="size-3.5" />
                Novo Artigo
              </button>
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
              className="group relative rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 dark:hover:bg-slate-800/80"
            >
              {isAdmin && (
                <div className="mb-4 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Editar artigo"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-emerald-400"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir artigo"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                    Excluir
                  </button>
                </div>
              )}

              <h2 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                {post.title}
              </h2>

              <time
                dateTime={post.date}
                className="mt-2 block text-sm text-slate-500 dark:text-slate-500"
              >
                {format(parseISO(post.date), "MMMM d, yyyy")}
              </time>
            </article>
          ))}
        </section>
      </div>

      <Sparkles className="pointer-events-none absolute right-8 bottom-8 size-6 text-slate-300 dark:text-slate-700" />

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={() => {
          setIsAdmin(true);
          setIsLoginOpen(false);
        }}
      />
    </div>
  );
}

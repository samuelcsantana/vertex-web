"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, Pencil, Plus, Shield, Trash2 } from "lucide-react";

import { LoginModal } from "./_components/LoginModal";

interface MockPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

const MOCK_POSTS: MockPost[] = [
  {
    id: "1",
    title: "Migrando um Monolito para Microsserviços sem Perder o Sono",
    excerpt:
      "Um mergulho prático nos padrões de decomposição de domínio, estratégias de dados distribuídos e como evitar as armadilhas clássicas de latência e acoplamento em sistemas legados.",
    date: "2026-06-12",
    readTime: "8 min",
    tags: ["Arquitetura", "Backend", "DDD"],
  },
  {
    id: "2",
    title: "Server Components na Prática: O Que Ninguém Te Conta",
    excerpt:
      "React Server Components prometem menos JavaScript no cliente, mas trazem um novo conjunto de armadilhas mentais. Compartilho os erros que cometi construindo em produção.",
    date: "2026-05-28",
    readTime: "6 min",
    tags: ["Next.js", "React", "Performance"],
  },
  {
    id: "3",
    title: "Cache Invalidation: A Segunda Coisa Mais Difícil da Computação",
    excerpt:
      "Estratégias de revalidação, tags de cache e como um revalidatePath mal colocado pode custar caro em produção. Um guia direto ao ponto sobre ISR no App Router.",
    date: "2026-05-10",
    readTime: "5 min",
    tags: ["Caching", "Next.js"],
  },
  {
    id: "4",
    title: "Design Systems Não São Sobre Componentes",
    excerpt:
      "Depois de migrar três produtos para um design system compartilhado, aprendi que o maior desafio nunca foi técnico — foi de governança e comunicação entre times.",
    date: "2026-04-22",
    readTime: "7 min",
    tags: ["Design System", "UX", "Frontend"],
  },
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

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 dark:text-slate-300">
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
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <Shield className="size-4" />
              Entrar como Admin (demo)
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
            Anotações de campo sobre arquitetura de sistemas, performance web e
            as decisões técnicas por trás de produtos reais.
          </p>

          {isAdmin && (
            <div className="mt-4 flex w-full flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Shield className="size-4" />
                Modo Administrador — Painel Ativo
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 sm:self-auto"
              >
                <Plus className="size-4" />
                Novo Artigo
              </button>
            </div>
          )}
        </section>

        <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {MOCK_POSTS.map((post) => (
            <article
              key={post.id}
              className="group relative rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 dark:hover:bg-slate-800/80"
            >
              {isAdmin && (
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label="Editar artigo"
                    className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 transition-colors hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-emerald-400"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir artigo"
                    className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 transition-colors hover:text-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {format(parseISO(post.date), "d MMM, yyyy")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
                {post.title}
              </h2>

              <p className="mt-3 line-clamp-3 text-slate-600 dark:text-slate-400">
                {post.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>

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

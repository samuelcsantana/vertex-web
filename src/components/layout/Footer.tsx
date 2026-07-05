import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>&copy; {new Date().getFullYear()} Vertex. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}

import { Suspense } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Projects } from "@/components/projects";
import { Contributions } from "@/components/contributions";
import { Footer } from "@/components/footer";

function Divider() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      <span className="h-px w-8 bg-border/50" />
      <span className="h-1 w-1 rounded-full bg-glow-muted/50" />
      <span className="h-px w-8 bg-border/50" />
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i.toString()}`}
            className="h-36 animate-pulse rounded-lg border border-border/30 bg-muted/10"
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-12">
          <Hero />
          <Divider />
          <About />
          <Divider />
          <div className="content-visibility-auto">
            <Suspense fallback={<ProjectsSkeleton />}>
              <Projects />
            </Suspense>
          </div>
          <Divider />
          <div className="content-visibility-auto">
            <Contributions />
          </div>
        </div>
        <div className="mt-12">
          <Footer />
        </div>
      </main>
    </>
  );
}

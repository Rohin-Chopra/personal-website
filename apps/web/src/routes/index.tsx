import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PostList } from "@/components/post-list";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinks } from "@/components/site-footer";
import { certifications } from "@/content/certifications";
import projects from "@/content/projects.json";
import { skillGroups } from "@/content/skills";
import { posts } from "@/lib/posts";
import { jsonLd, seo } from "@/lib/seo";
import { SITE_NAME, SITE_ROLE, SITE_URL, SOCIAL_LINKS } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => {
    const { meta, links } = seo({ path: "/" });
    return {
      meta,
      links,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE_NAME,
          jobTitle: SITE_ROLE,
          url: SITE_URL,
          image: `${SITE_URL}/img/hero.webp`,
          sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin],
        }),
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <section
        aria-labelledby="writing"
        className="container-page py-20 sm:py-28"
      >
        <SectionHeading
          index="01"
          title="Writing"
          id="writing"
          description={
            <>
              Notes from building on <em>AWS</em>.
            </>
          }
          action={
            <Link
              to="/blogs"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
            >
              All posts
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          }
        />
        <PostList posts={posts.slice(0, 3)} />
      </section>

      <section
        aria-labelledby="projects"
        className="container-page py-20 sm:py-28"
      >
        <SectionHeading
          index="02"
          title="Projects"
          id="projects"
          description={
            <>
              Things I&apos;ve <em>shipped</em>.
            </>
          }
          action={
            <Link
              to="/projects"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
            >
              All projects
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.title} project={project} compact />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="toolbox"
        className="container-page py-20 sm:py-28"
      >
        <SectionHeading
          index="03"
          title="Toolbox"
          id="toolbox"
          description={
            <>
              What I build <em>with</em>.
            </>
          }
        />
        <div className="grid gap-10 md:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 font-mono text-xs tracking-widest text-muted uppercase">
                {group.title}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.skills.map(({ name, icon: Icon }) => (
                  <li
                    key={name}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm"
                  >
                    <Icon aria-hidden className="size-4 text-muted" />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="mb-6 font-mono text-xs tracking-widest text-muted uppercase">
            Certifications · {certifications.length}
          </h3>
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {certifications.map((cert) => (
              <li
                key={cert.name}
                className="group relative grid aspect-square place-items-center rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-accent/40"
              >
                <img
                  src={cert.image}
                  alt={cert.name}
                  title={cert.name}
                  width={120}
                  height={120}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="container-page scroll-mt-20 py-20 sm:py-28"
      >
        <div className="grid gap-12 rounded-3xl border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[2fr_3fr] lg:p-14">
          <div>
            <p className="mb-3 font-mono text-xs tracking-widest text-muted uppercase">
              <span className="text-accent">04</span> / Contact
            </p>
            <h2
              id="contact-heading"
              className="font-serif text-4xl tracking-tight sm:text-5xl"
            >
              Let&apos;s <em>talk</em>.
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-muted">
              Got a question, an idea or a role you think I&apos;d be a good fit
              for? Send me a message and I&apos;ll get back to you.
            </p>
            <SocialLinks className="mt-6 -ml-2" />
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 -right-40 size-[36rem] rounded-full bg-accent/15 blur-3xl"
      />
      <div className="container-page relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_auto] lg:py-36">
        <div className="max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {SITE_ROLE}
          </p>
          <h1 className="font-serif text-6xl leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-8xl">
            Hi, I&apos;m Rohin.
            <br />
            <span className="text-muted">
              I build things that <em className="text-accent">scale</em>.
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            I&apos;m incredibly passionate about solving problems, and tech is
            my weapon of choice. I excel in architecting, designing and
            developing robust and scalable solutions.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              hash="contact"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent hover:text-accent-ink"
            >
              Say hello
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-6 py-3 font-medium backdrop-blur transition-colors hover:border-ink/30"
            >
              Read the blog
            </Link>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-3 text-sm font-medium text-muted hover:text-ink"
            >
              GitHub
              <ArrowUpRight aria-hidden className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div className="relative mx-auto hidden size-72 shrink-0 lg:block xl:size-80">
          <div className="absolute inset-0 rotate-6 rounded-[2.5rem] bg-accent/20" />
          <img
            src="/img/hero.webp"
            alt="Rohin Chopra"
            width={560}
            height={560}
            fetchPriority="high"
            className="relative size-full rounded-[2.5rem] border border-line bg-accent-soft object-cover"
          />
        </div>
      </div>
    </section>
  );
}

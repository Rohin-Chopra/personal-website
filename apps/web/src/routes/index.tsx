import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";

import { ArchitectureFigure } from "@/components/architecture-figure";
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
        aria-label="How this site works"
        className="container-page pb-12 sm:pb-16"
      >
        <ArchitectureFigure />
      </section>

      <section
        aria-labelledby="writing"
        className="container-page py-16 sm:py-24"
      >
        <SectionHeading
          index="01"
          title="Writing"
          id="writing"
          description={
            <>
              Field notes from building on <em>AWS</em>.
            </>
          }
          action={<MoreLink to="/blogs">All posts</MoreLink>}
        />
        <PostList posts={posts.slice(0, 3)} />
      </section>

      <section
        aria-labelledby="projects"
        className="container-page py-16 sm:py-24"
      >
        <SectionHeading
          index="02"
          title="Projects"
          id="projects"
          description={
            <>
              Things I&apos;ve built and <em>shipped</em>.
            </>
          }
          action={<MoreLink to="/projects">All projects</MoreLink>}
        />
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              figure={`2.${i + 1}`}
              compact
            />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="toolbox"
        className="container-page py-16 sm:py-24"
      >
        <SectionHeading
          index="03"
          title="Toolbox"
          id="toolbox"
          description={
            <>
              The bill of <em>materials</em>.
            </>
          }
        />
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {skillGroups.map((group, g) => {
            const letter = String.fromCharCode(65 + g);
            return (
              <div key={group.title}>
                <h3 className="label flex gap-3 border-b border-ink pb-2 text-ink">
                  <span className="text-accent">{letter}</span>
                  {group.title}
                </h3>
                <ul>
                  {group.skills.map(({ name, icon: Icon }, i) => (
                    <li
                      key={name}
                      className="group flex items-center gap-4 border-b border-dashed border-line py-3"
                    >
                      <span className="font-mono text-[11px] text-muted tabular-nums">
                        {letter}.{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] font-medium">{name}</span>
                      <Icon
                        aria-hidden
                        className="ml-auto size-4 text-muted transition-colors group-hover:text-accent"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-20">
          <h3 className="label mb-6 flex items-center gap-4 text-muted">
            <span className="text-ink">Certified</span>
            <span className="h-px flex-1 bg-line" />
            <span>
              {String(certifications.length).padStart(2, "0")} credentials
            </span>
          </h3>
          <ul className="grid grid-cols-3 gap-px border border-line bg-line sm:grid-cols-5 lg:grid-cols-9">
            {certifications.map((cert) => (
              <li
                key={cert.name}
                className="group grid aspect-square place-items-center bg-paper p-4"
              >
                <img
                  src={cert.image}
                  alt={cert.name}
                  title={cert.name}
                  width={120}
                  height={120}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain opacity-80 grayscale transition-all duration-500 group-hover:-translate-y-1 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="container-page scroll-mt-20 py-16 sm:py-24"
      >
        <div className="border-t-2 border-ink pt-3">
          <p className="label flex gap-4 text-muted">
            <span className="text-accent">§ 04</span>
            <span>Contact</span>
          </p>
        </div>
        <div className="mt-6 grid gap-14 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <div>
            <h2
              id="contact-heading"
              className="font-display text-6xl leading-[0.92] sm:text-8xl"
            >
              Let&apos;s
              <br />
              <em className="font-wonk text-accent">talk.</em>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">
              Got a question, an idea or a role you think I&apos;d be a good fit
              for? Send me a message and I&apos;ll get back to you.
            </p>
            <SocialLinks className="mt-6 -ml-2.5" />
          </div>
          <div className="bg-grid border border-line bg-surface p-6 sm:p-10">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

const MoreLink = ({
  to,
  children,
}: {
  to: "/blogs" | "/projects";
  children: string;
}) => (
  <Link
    to={to}
    className="label group inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
  >
    {children}
    <ArrowRight
      aria-hidden
      className="size-3.5 transition-transform group-hover:translate-x-1"
    />
  </Link>
);

const rise = (i: number): CSSProperties => ({
  animationDelay: `${120 + i * 110}ms`,
});

function Hero() {
  return (
    <section className="relative">
      <div className="container-page pt-10 pb-16 sm:pt-14 sm:pb-24">
        <div className="label flex items-center justify-between gap-4 text-muted">
          <span className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-accent" />
            {SITE_ROLE}
          </span>
          <span className="hidden sm:inline">Sheet 00 · Index</span>
        </div>

        <div className="mt-10 grid items-end gap-12 lg:mt-14 lg:grid-cols-[1fr_19rem] xl:grid-cols-[1fr_22rem]">
          <h1 className="font-display text-[clamp(3.4rem,10vw,9.5rem)] leading-[0.88]">
            <span className="block animate-rise" style={rise(0)}>
              Hi, I&apos;m Rohin.
            </span>
            <span className="block animate-rise text-muted" style={rise(1)}>
              I build things
            </span>
            <span className="block animate-rise text-muted" style={rise(2)}>
              that{" "}
              <span className="relative inline-block text-ink">
                <em className="font-wonk text-accent">scale</em>
                <svg
                  aria-hidden
                  viewBox="0 0 300 30"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.08em] left-[-4%] h-[0.22em] w-[108%] overflow-visible"
                >
                  <path
                    d="M4 22 C 60 8, 140 4, 200 12 S 280 22, 296 8"
                    pathLength={1}
                    strokeDasharray="1"
                    className="animate-draw fill-none stroke-accent"
                    style={{ animationDelay: "900ms" }}
                    strokeWidth={5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
              .
            </span>
          </h1>

          <figure className="hidden animate-rise lg:block" style={rise(3)}>
            <div className="plate group border border-line bg-surface p-2.5">
              <img
                src="/img/hero.webp"
                alt="Rohin Chopra"
                width={560}
                height={560}
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover contrast-[1.05] grayscale transition-[filter] duration-700 group-hover:grayscale-0"
              />
            </div>
            <figcaption className="label mt-3 flex justify-between text-muted">
              <span className="text-accent">Pl. 1</span>
              <span>The engineer</span>
            </figcaption>
          </figure>
        </div>

        <div className="mt-14 grid gap-10 border-t border-line pt-8 sm:mt-20 md:grid-cols-[1fr_auto] md:items-end">
          <p
            className="max-w-xl animate-rise text-lg leading-relaxed text-muted sm:text-xl"
            style={rise(4)}
          >
            I&apos;m incredibly passionate about solving problems, and tech is
            my weapon of choice. I excel in architecting, designing and
            developing{" "}
            <span className="text-ink">robust and scalable solutions</span>.
          </p>
          <div
            className="flex animate-rise flex-wrap items-center gap-3"
            style={rise(5)}
          >
            <Link
              to="/"
              hash="contact"
              className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-medium text-paper transition-colors hover:bg-accent hover:text-accent-ink"
            >
              Say hello
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              to="/blogs"
              className="group inline-flex items-center gap-2 border border-ink px-6 py-3.5 font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Read the blog
              <ArrowDownRight
                aria-hidden
                className="size-4 transition-transform group-hover:rotate-[-45deg]"
              />
            </Link>
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="label inline-flex items-center gap-1 px-3 py-3 text-muted hover:text-accent"
            >
              GitHub
              <ArrowUpRight aria-hidden className="size-3.5" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

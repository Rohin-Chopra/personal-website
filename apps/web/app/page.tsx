import Image from "next/image";
import Link from "next/link";
import { FaAws, FaGithub, FaReact } from "react-icons/fa";
import {
  SiBootstrap,
  SiDocker,
  SiFigma,
  SiGatsby,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiTailwindcss,
  SiTerraform,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { SiMicrosoftazure } from "react-icons/si";

import { ContactForm } from "@/components/contact-form";
import { Button } from "@/components/elements/button";
import { BlogItem } from "@/components/blog-item";
import { getBlogs } from "@/lib/getBlogs";
import projects from "./(subpages)/projects/projects.json";

const HomePage = async () => {
  const posts = await getBlogs();
  const featuredProjects = projects.slice(0, 3);

  return (
    <>
      <section id="hero" className="md:h-[90vh]">
        <div className="flex h-full flex-col-reverse justify-end bg-primary dark:bg-dark md:grid md:grid-cols-3 md:bg-white md:py-0">
          <div className="relative">
            <div className="flex justify-center md:justify-end">
              <div className="-right-6 z-10 mt-12 md:absolute">
                <Image
                  className="rounded-full bg-lime-200 dark:bg-primary"
                  alt="Rohin Chopra"
                  src="/hero.png"
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </div>
          <div className="col-span-2 rounded-bl-3xl bg-primary px-8 dark:bg-transparent md:border-l-2 md:border-white md:dark:border-primary md:dark:bg-darkGray ">
            <div className="text-4xl font-bold text-white dark:text-white md:mt-24 lg:text-6xl">
              <h1 className="mb-4">I&apos;m Rohin Chopra.</h1>
              <p className="max-w-2xl text-lg font-normal dark:text-white">
                I&apos;m incredibly passionate about solving problems, and tech
                is my weapon of choice. I excel in architecting, designing and
                developing robust and scalable solutions.
              </p>
              <Link
                href="#contact"
                className="mt-4 inline-block w-full cursor-pointer rounded border-solid bg-white px-8 py-4 text-center text-base text-black shadow dark:bg-primary dark:text-white md:w-auto md:dark:bg-primary"
              >
                Say Hello
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section id="skills" className="py-8 dark:text-white md:px-6">
        <div className="container mx-auto">
          <h2 className="mb-2 mt-4 text-2xl font-bold md:text-4xl">Skills</h2>
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-semibold opacity-80">
              Languages And Frameworks
            </h3>
            <div className="grid grid-cols-2 justify-items-center gap-y-4 text-5xl md:grid-cols-8 md:gap-y-0 md:text-6xl">
              <SiTypescript
                title="TypeScript"
                className="transition-colors duration-300 hover:text-[#007acc]"
              />
              <SiJavascript
                title="Javascript"
                className="transition-colors duration-300 hover:text-[#f0db4f]"
              />
              <SiNodedotjs
                title="Node.js"
                className="transition-colors duration-300 hover:text-[#68a063]"
              />
              <FaReact
                title="React"
                className="transition-colors duration-300 hover:text-[#007acc]"
              />
              <SiNextdotjs title="Next.js" />
              <SiGatsby
                title="Gatsby"
                className="transition-colors duration-300 hover:text-[#663399]"
              />
              <SiTailwindcss
                title="Tailwindcss"
                className="transition-colors duration-300 hover:text-[#37BCF8]"
              />
              <SiBootstrap
                title="Bootstrap"
                className="transition-colors duration-300 hover:text-[#563d7c]"
              />
            </div>
          </div>
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-semibold opacity-80">
              Technologies
            </h3>
            <div className="grid grid-cols-2 justify-items-center gap-y-4 text-5xl md:grid-cols-8 md:text-6xl">
              <SiPostgresql
                title="PostgreSQL"
                className="transition-colors duration-300 hover:text-[#336790]"
              />
              <SiMysql title="MySQL" />
              <SiMongodb title="MongoDB" />
              <SiDocker
                title="Docker"
                className="transition-colors duration-300 hover:text-[#0db7ed]"
              />
              <SiFigma title="Figma" />
            </div>
          </div>
          <div className="mb-12">
            <h3 className="mb-4 text-xl font-semibold opacity-80">Services</h3>
            <div className="grid grid-cols-2 justify-items-center gap-y-4 text-6xl md:grid-cols-8">
              <FaAws title="AWS" />
              <SiMicrosoftazure
                title="Azure"
                className="transition-colors duration-300 hover:text-[#008AD7]"
              />
              <SiTerraform
                title="Terraform"
                className="transition-colors duration-300 hover:text-[#7A42BC]"
              />
              <FaGithub title="Github" />
              <SiVercel title="Vercel" />
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-semibold opacity-80">
              Certifications
            </h3>
            <div className="grid grid-cols-2 justify-items-center gap-y-4 text-6xl md:grid-cols-8">
              <Image
                src="/aws-certified-cloud-practitioner.png"
                height={125}
                width={125}
                alt="AWS Cloud Practitioner Certificate"
              />
              <Image
                src="/aws-certified-solutions-architect-associate.png"
                height={125}
                width={125}
                alt="AWS Solutions Architect Certificate"
              />
              <Image
                src="/aws-certified-developer-associate.png"
                height={125}
                width={125}
                alt="AWS Developer Associate Certificate"
              />
              <Image
                src="/aws-certified-sysops-administrator-associate.png"
                height={125}
                width={125}
                alt="AWS SysOps Administrator Certificate"
              />
              <Image
                src="/aws-certified-security-specialty.png"
                height={125}
                width={125}
                alt="AWS Security Specialty Certificate"
              />
              <Image
                src="/aws-certified-database-specialty.png"
                height={125}
                width={125}
                alt="AWS Database Specialty Certificate"
              />
              <Image
                src="/aws-certified-solutions-architect-professional.png"
                height={125}
                width={125}
                alt="AWS Solutions Architect Professional"
              />
              <Image
                src="/microsoft-certified-fundamentals-badge.svg"
                height={125}
                width={125}
                alt="Microsoft AZ-900 Certificate"
              />
              <Image
                src="/hashicorp-certified-terraform-associate-003.png"
                height={125}
                width={125}
                alt="Hashicorp Terraform Associate Certificate"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-8 dark:text-white md:px-6">
        <div className="container mx-auto">
          <h2 className="mb-2 mt-4 text-2xl font-bold md:text-4xl">
            Featured Projects
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <div
                key={project.title}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-darkGray"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={project.imgUrl}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-bold">{project.title}</h3>
                  {project.description && (
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </p>
                  )}
                  <Link
                    href="/projects"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View all projects →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blogs" className="py-8 dark:text-white md:px-6">
        <div className="container mx-auto">
          <h2 className="mt-4 text-2xl font-bold md:mb-2 md:text-4xl">
            Blogs I&apos;ve written
          </h2>
          <div>
            {posts.slice(0, 3).map((post, index) => (
              <div className="my-6 md:my-8" key={post.slug}>
                <BlogItem blog={post} />
                {index !== posts.length - 1 && (
                  <hr className="mt-6 border-t-slate-800 dark:border-t-slate-400 md:mt-8" />
                )}
              </div>
            ))}
            <Link href="/blogs">
              <Button className="mx-auto block bg-primary">View More</Button>
            </Link>
          </div>
        </div>
      </section>
      <section id="contact" className="py-8 dark:text-white md:px-6">
        <div className="container mx-auto">
          <div className="md:grid md:grid-cols-2">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold md:mb-2 md:text-4xl">
                Let&apos;s talk
              </h2>
              <p className="opacity-80">
                Got any questions or want to reach out to me?
              </p>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;

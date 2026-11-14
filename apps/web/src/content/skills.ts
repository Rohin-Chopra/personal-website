import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa6";
import {
  SiDocker,
  SiFigma,
  SiGithubactions,
  SiGo,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPulumi,
  SiReact,
  SiTailwindcss,
  SiTerraform,
  SiTypescript,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";

export type Skill = { name: string; icon: IconType };

export const skillGroups: { title: string; skills: Skill[] }[] = [
  {
    title: "Languages & frameworks",
    skills: [
      { name: "TypeScript", icon: SiTypescript },
      { name: "Node.js", icon: SiNodedotjs },
      { name: "Go", icon: SiGo },
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "Tailwind CSS", icon: SiTailwindcss },
    ],
  },
  {
    title: "Cloud & infrastructure",
    skills: [
      { name: "AWS", icon: FaAws },
      { name: "Azure", icon: VscAzure },
      { name: "Terraform", icon: SiTerraform },
      { name: "Pulumi", icon: SiPulumi },
      { name: "Docker", icon: SiDocker },
      { name: "GitHub Actions", icon: SiGithubactions },
    ],
  },
  {
    title: "Data & design",
    skills: [
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "MySQL", icon: SiMysql },
      { name: "MongoDB", icon: SiMongodb },
      { name: "Figma", icon: SiFigma },
    ],
  },
];

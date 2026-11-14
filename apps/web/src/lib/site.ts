export const SITE_URL = "https://www.rohinchopra.com";
export const SITE_NAME = "Rohin Chopra";
export const SITE_ROLE = "Senior Software Engineer";
export const SITE_DESCRIPTION =
  "Rohin Chopra is a Senior Software Engineer who excels in architecting, designing and developing robust and scalable solutions";

export const SOCIAL_LINKS = {
  github: "https://github.com/Rohin-Chopra",
  linkedin: "https://www.linkedin.com/in/rohin-chopra-2b38791a0/",
} as const;

/** Contact API, injected at build time (see .env.example). */
export const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  string | undefined;

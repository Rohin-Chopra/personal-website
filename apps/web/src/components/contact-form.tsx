import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import { z } from "zod";

import { API_KEY, API_URL, TURNSTILE_SITE_KEY } from "@/lib/site";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter a name")
    .max(100, "Please keep your name under 100 characters"),
  email: z
    .string()
    .trim()
    .max(255, "Please enter a valid email")
    .pipe(z.email("Please enter a valid email")),
  message: z
    .string()
    .trim()
    .min(1, "Please enter a message")
    .max(5000, "Please keep your message under 5000 characters"),
});

type Field = keyof z.infer<typeof schema>;
type FieldErrors = Partial<Record<Field, string>>;
type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent" }
  | { state: "error"; title: string; description: string };

type ApiResponse = {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

const readJson = async (res: Response): Promise<ApiResponse> => {
  try {
    return (await res.json()) as ApiResponse;
  } catch {
    return {};
  }
};

const errorFor = (
  status: number,
  body: ApiResponse,
): Extract<Status, { state: "error" }> => {
  if (status === 400 && body.errors?.length) {
    return {
      state: "error",
      title: "Please check your details",
      description: body.errors.map((e) => e.message).join(", "),
    };
  }
  if (status === 403) {
    return {
      state: "error",
      title: "Couldn't verify you're human",
      description: "Please complete the check and try again.",
    };
  }
  if (status === 429) {
    return {
      state: "error",
      title: "Too many requests",
      description: "Please wait a moment before trying again.",
    };
  }
  return {
    state: "error",
    title: "Something went wrong",
    description:
      "Your message wasn't sent. Please try again in a little while.",
  };
};

const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-surface px-4 py-3 text-[15px] transition-colors placeholder:text-muted/70 focus:ring-2 focus:outline-none ${
    invalid
      ? "border-danger focus:border-danger focus:ring-danger/25"
      : "border-line focus:border-accent focus:ring-accent/25"
  }`;

export const ContactForm = () => {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const id = useId();

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || document.querySelector("script[data-turnstile]"))
      return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "";
    document.head.append(script);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as Field;
        next[field] ??= issue.message;
      }
      setErrors(next);
      const first = (["name", "email", "message"] as const).find(
        (f) => next[f],
      );
      if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus({ state: "sending" });

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        },
        body: JSON.stringify({
          ...parsed.data,
          email: parsed.data.email.toLowerCase(),
          website: data.get("website") ?? "",
          // Turnstile adds this hidden input once the challenge is solved.
          turnstileToken: data.get("cf-turnstile-response") ?? undefined,
        }),
      });

      if (!res.ok) {
        setStatus(errorFor(res.status, await readJson(res)));
        return;
      }

      form.reset();
      setStatus({ state: "sent" });
    } catch {
      setStatus({
        state: "error",
        title: "Network error",
        description: "Please check your connection and try again.",
      });
    } finally {
      if (TURNSTILE_SITE_KEY) window.turnstile?.reset();
    }
  };

  const field = (name: Field) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    className: inputClass(Boolean(errors[name])),
    onInput: () => {
      if (errors[name])
        setErrors((current) => ({ ...current, [name]: undefined }));
      if (status.state !== "idle" && status.state !== "sending")
        setStatus({ state: "idle" });
    },
  });

  const fieldError = (name: Field) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-sm text-danger">
        {errors[name]}
      </p>
    ) : null;

  const sending = status.state === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div
        aria-hidden
        className="absolute -left-[9999px] size-px overflow-hidden"
      >
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="mb-2 block text-sm font-medium"
          >
            Name
          </label>
          <input
            {...field("name")}
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
          />
          {fieldError("name")}
        </div>
        <div>
          <label
            htmlFor={`${id}-email`}
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="ada@example.com"
          />
          {fieldError("email")}
        </div>
      </div>
      <div>
        <label
          htmlFor={`${id}-message`}
          className="mb-2 block text-sm font-medium"
        >
          Message
        </label>
        <textarea
          {...field("message")}
          rows={6}
          placeholder="What would you like to talk about?"
          className={`${inputClass(Boolean(errors.message))} resize-y`}
        />
        {fieldError("message")}
      </div>

      {TURNSTILE_SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-theme="auto"
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-paper transition-all hover:bg-accent hover:text-accent-ink disabled:opacity-70"
        >
          {sending ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>

        <div role="status" aria-live="polite" className="text-sm">
          {status.state === "sent" && (
            <p className="flex items-center gap-2 text-success">
              <CircleCheck aria-hidden className="size-4" />
              Message sent. Thanks for reaching out!
            </p>
          )}
          {status.state === "error" && (
            <p className="flex items-start gap-2 text-danger">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                <strong className="font-semibold">{status.title}.</strong>{" "}
                {status.description}
              </span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

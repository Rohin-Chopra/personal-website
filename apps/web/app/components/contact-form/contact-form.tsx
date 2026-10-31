"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const API_URI = process.env.NEXT_PUBLIC_API_URI;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter a name"),
  email: z.string().trim().email("Please enter a valid email"),
  message: z.string().trim().min(1, "Please enter a message"),
});

type FormInputs = z.infer<typeof schema>;

type ApiResponse = {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

const parseJson = async (res: Response): Promise<ApiResponse> => {
  try {
    return (await res.json()) as ApiResponse;
  } catch {
    return {};
  }
};

export const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
  });
  const { toast } = useToast();

  const onSubmitSuccess: SubmitHandler<FormInputs> = async (data) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URI}/contact`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          message: data.message,
        }),
      });

      const responseData = await parseJson(res);

      if (!res.ok) {
        if (res.status === 400 && responseData.errors) {
          const errorMessages = responseData.errors
            .map((err) => err.message)
            .join(", ");
          toast({
            title: "Validation error",
            description:
              errorMessages ||
              responseData.message ||
              "Please check your input",
            variant: "destructive",
          });
          return;
        }

        if (res.status === 429) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before trying again",
            variant: "destructive",
          });
          return;
        }

        throw new Error(
          responseData.message || "Received an error from the API",
        );
      }

      reset();
      toast({
        title: "Message sent",
        description: "Thanks for contacting me",
      });
    } catch (error) {
      // fetch rejects with a TypeError when the request never reaches the API
      if (error instanceof TypeError) {
        toast({
          title: "Network error",
          description: "Please check your internet connection and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Oops, something went wrong",
          description:
            (error instanceof Error && error.message) ||
            "There was a problem with your request",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fieldProps = (field: keyof FormInputs) => ({
    id: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: cn(errors[field] && "border-danger"),
    ...register(field),
  });

  const renderError = (field: keyof FormInputs) =>
    errors[field]?.message ? (
      <p id={`${field}-error`} role="alert" className="mt-1 text-danger">
        {errors[field]?.message}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmitSuccess)} noValidate>
      <div className="mb-4">
        <label className="mb-2 block" htmlFor="name">
          Name
        </label>
        <Input {...fieldProps("name")} autoComplete="name" />
        {renderError("name")}
      </div>
      <div className="mb-4">
        <label className="mb-2 block" htmlFor="email">
          Email
        </label>
        <Input {...fieldProps("email")} type="email" autoComplete="email" />
        {renderError("email")}
      </div>
      <div>
        <label className="mb-2 block" htmlFor="message">
          Message
        </label>
        <Textarea
          {...fieldProps("message")}
          rows={5}
          className={cn("resize-none", errors.message && "border-danger")}
        />
        {renderError("message")}
      </div>
      <Button
        type="submit"
        variant="default"
        disabled={isLoading}
        aria-busy={isLoading}
        className="mt-4 w-full bg-primary font-semibold text-white hover:bg-primary/90 md:text-lg"
      >
        {isLoading ? (
          <>
            <FaSpinner className="inline animate-spin text-white" aria-hidden />
            <span className="sr-only">Sending…</span>
          </>
        ) : (
          <span>Let&apos;s Talk</span>
        )}
      </Button>
    </form>
  );
};

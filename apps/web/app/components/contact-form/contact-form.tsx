"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const API_URI = process.env.NEXT_PUBLIC_API_URI;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const schema = z.object({
  name: z.string().min(1, "Please enter a name"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(1, "Please enter a message"),
});

type FormInputs = z.infer<typeof schema>;

export const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
  });
  const { toast } = useToast();

  const onSubmitSuccess: SubmitHandler<FieldValues> = async (data) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URI}/contact`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY as string,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          message: data.message.trim(),
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Handle validation errors from API
        if (res.status === 400 && responseData.errors) {
          const errorMessages = responseData.errors
            .map((err: { field: string; message: string }) => err.message)
            .join(", ");
          toast({
            title: "Validation error",
            description: errorMessages || responseData.message || "Please check your input",
            variant: "destructive",
          });
          return;
        }

        // Handle rate limiting
        if (res.status === 429) {
          toast({
            title: "Too many requests",
            description: "Please wait a moment before trying again",
            variant: "destructive",
          });
          return;
        }

        throw new Error(responseData.message || "Received an error from the API");
      }

      toast({
        title: "Message sent",
        description: "Thanks for contacting me",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Network errors
      if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
        toast({
          title: "Network error",
          description: "Please check your internet connection and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Oops, something went wrong",
          description: errorMessage || "There was a problem with your request",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitSuccess)}>
      <div className="mb-4">
        <label className="mb-2 block" htmlFor="name">
          Name
        </label>
        <Input
          id="name"
          {...register("name")}
          className={errors.name?.message ? "border-danger" : ""}
          autoComplete="name"
        />
        <span className="mt-1 text-danger">{errors.name?.message}</span>
      </div>
      <div className="mb-4">
        <label className="mb-2 block" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email?.message ? "border-danger" : ""}
          autoComplete="email"
        />
        <span className="mt-1 text-danger">{errors.email?.message}</span>
      </div>
      <div>
        <label className="mb-2 block" htmlFor="message">
          Message
        </label>
        <Textarea
          id="message"
          rows={5}
          {...register("message")}
          className={errors.message?.message ? "border-danger resize-none" : "resize-none"}
        />
        <span className="mt-1 text-danger">{errors.message?.message}</span>
      </div>
      <Button
        type="submit"
        variant="default"
        disabled={isLoading}
        className="mt-4 w-full bg-primary text-white hover:bg-primary/90 font-semibold md:text-lg"
      >
        {isLoading ? (
          <FaSpinner className="inline animate-spin text-white" />
        ) : (
          <span>Let&apos;s Talk</span>
        )}
      </Button>
    </form>
  );
};




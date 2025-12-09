"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useState } from "react";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { z } from "zod";

import { Button } from "@/components/elements/button";
import { Input } from "@/components/elements/input";
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
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      if (res.status !== 200) {
        throw new Error("Received an error from the API");
      }
      toast({
        title: "Message sent",
        description: "Thanks for contacting me",
      });
    } catch (error) {
      toast({
        title: "Oops, something went wrong",
        description: "There was a problem with your request",
        variant: "destructive",
      });
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
          name="name"
          register={register}
          isError={!!errors.name?.message}
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
          name="email"
          register={register}
          isError={!!errors.email?.message}
          autoComplete="email"
        />
        <span className="mt-1 text-danger">{errors.email?.message}</span>
      </div>
      <div>
        <label className="mb-2 block" htmlFor="message">
          Message
        </label>
        <textarea
          className={clsx({
            "bg-zinc-100 dark:bg-darkGray w-full focus:outline-none focus:border focus:border-primary py-2 px-2 transition-colors resize-none":
              true,
            "border border-danger": !!errors.message?.message,
          })}
          id="message"
          cols={20}
          rows={5}
          {...register("message")}
        ></textarea>
        <span className="mt-1 text-danger">{errors.message?.message}</span>
      </div>
      <Button
        type="submit"
        variant={Button.Variants.PRIMARY}
        disabled={isLoading}
        className="mt-4 w-full py-2 font-semibold disabled:opacity-60 md:text-lg"
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



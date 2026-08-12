"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Aurora } from "@/components/bits/Aurora";
import { Container } from "@/components/layout/Container";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { contact } from "@/lib/content";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.email("Please enter a valid work email"),
  organisation: z.string().min(2, "Please enter your organisation"),
  role: z.enum(contact.form.roles),
  message: z.string().min(10, "Please add a short message"),
  /** honeypot — must stay empty */
  company_website: z.string().max(0).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full rounded border border-line bg-glass px-4 py-3 text-sm text-primary placeholder:text-tertiary " +
  "transition-colors duration-200 focus:border-teal-500 focus:outline-none";

/**
 * 09 — CONTACT: navy-950 with the aurora background. Form left (validation,
 * inline errors, loading/success/error states, honeypot), bordered detail
 * grid right (CLAUDE.md §11).
 */
export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success || values.company_website) {
      // honeypot hit or invalid — pretend success to bots, surface errors to humans
      if (values.company_website) {
        setStatus("success");
        return;
      }
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
    if (!endpoint) {
      // graceful fallback: hand off to the visitor's mail client
      const body = encodeURIComponent(
        `${values.message}\n\n— ${values.name}, ${values.role}, ${values.organisation} (${values.email})`,
      );
      window.location.href = `mailto:${contact.details.email}?subject=EpiNova enquiry&body=${body}`;
      setStatus("success");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id={contact.id} data-strand-node className="relative overflow-hidden border-t border-line bg-navy-950">
      {/* aurora — teal → deep teal → copper, per §10 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-45">
        <Aurora stops={["--teal-500", "--teal-600", "--copper-500"]} amplitude={0.8} />
      </div>

      <Container className="section-pad relative">
        <MonoLabel text={contact.label} className="mb-6" />
        <h2 className="type-h2 max-w-2xl">{contact.h2}</h2>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* form */}
          <form
            className="space-y-5 lg:col-span-7"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="type-label mb-2 block text-tertiary">
                  {contact.form.fields.name}
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  className={inputClass}
                  {...register("name", { required: true })}
                />
                {errors.name && (
                  <p role="alert" className="mt-1.5 text-xs text-copper-400">
                    Please enter your name
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="type-label mb-2 block text-tertiary">
                  {contact.form.fields.email}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  {...register("email", {
                    required: true,
                    pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  })}
                />
                {errors.email && (
                  <p role="alert" className="mt-1.5 text-xs text-copper-400">
                    Please enter a valid work email
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="organisation" className="type-label mb-2 block text-tertiary">
                  {contact.form.fields.organisation}
                </label>
                <input
                  id="organisation"
                  autoComplete="organization"
                  className={inputClass}
                  {...register("organisation", { required: true })}
                />
                {errors.organisation && (
                  <p role="alert" className="mt-1.5 text-xs text-copper-400">
                    Please enter your organisation
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="role" className="type-label mb-2 block text-tertiary">
                  {contact.form.fields.role}
                </label>
                <select id="role" className={inputClass} {...register("role", { required: true })}>
                  {contact.form.roles.map((role) => (
                    <option key={role} value={role} className="bg-navy-900">
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="message" className="type-label mb-2 block text-tertiary">
                {contact.form.fields.message}
              </label>
              <textarea
                id="message"
                rows={5}
                className={inputClass}
                {...register("message", { required: true, minLength: 10 })}
              />
              {errors.message && (
                <p role="alert" className="mt-1.5 text-xs text-copper-400">
                  Please add a short message
                </p>
              )}
            </div>

            {/* honeypot — visually hidden but present for bots */}
            <div className="sr-only" aria-hidden>
              <label htmlFor="company_website">Company website</label>
              <input
                id="company_website"
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                {...register("company_website")}
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="group inline-flex min-h-11 items-center gap-2 rounded bg-teal-500 px-8 py-3 text-sm font-medium text-navy-950 transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-teal-400 hover:shadow-glow-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? contact.form.sending : contact.form.submit}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </button>

            <div aria-live="polite">
              {status === "success" && (
                <p className="text-sm text-teal-300">{contact.form.success}</p>
              )}
              {status === "error" && (
                <p role="alert" className="text-sm text-copper-400">
                  {contact.form.error}
                </p>
              )}
            </div>
          </form>

          {/* details — bordered grid cells */}
          <div className="grid grid-cols-1 content-start divide-y divide-line border border-line lg:col-span-5">
            <a
              href={`mailto:${contact.details.email}`}
              className="p-6 text-sm text-secondary transition-colors duration-200 hover:text-primary"
            >
              <span className="type-label mb-1.5 block text-tertiary">Email</span>
              {contact.details.email}
            </a>
            <a
              href={`tel:${contact.details.phone.replace(/\s/g, "")}`}
              className="p-6 text-sm text-secondary transition-colors duration-200 hover:text-primary"
            >
              <span className="type-label mb-1.5 block text-tertiary">Phone</span>
              {contact.details.phone}
            </a>
            <a
              href={contact.details.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 text-sm text-secondary transition-colors duration-200 hover:text-primary"
            >
              <span className="type-label mb-1.5 block text-tertiary">LinkedIn</span>
              EpiNova
            </a>
            <div className="p-6 text-sm text-secondary">
              <span className="type-label mb-1.5 block text-tertiary">LEAP 2026</span>
              {contact.details.booth}
              <p className="mt-2 text-xs text-tertiary">{contact.details.qrCaption}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

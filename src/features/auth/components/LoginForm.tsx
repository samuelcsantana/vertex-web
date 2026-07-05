"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import { loginAction } from "@/features/auth/actions/auth-actions";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login-schema";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginSchema) {
    setServerError(null);
    const result = await loginAction(data);

    if (result.success) {
      router.push("/dashboard");
      return;
    }

    setServerError(result.error ?? "Something went wrong. Please try again.");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in to Vertex</CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              <FieldError
                errors={errors.password ? [errors.password] : undefined}
              />
            </Field>

            {serverError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {serverError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

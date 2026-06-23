"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { createUser, getUserByEmail, createVerificationToken } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const next = String(formData.get("next") || "/account");

  const user = await getUserByEmail(parsed.data.email);
  if (user) {
    const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (valid && !user.email_verified) {
      return { error: `UNVERIFIED:${user.email}` };
    }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: next,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "That email and password don't match our records." };
    }
    throw error;
  }
}

const signupSchema = z.object({
  name: z.string().min(1, "Tell us what to call you."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type SignupState = { error?: string } | undefined;

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const userId = await createUser(parsed.data.name, parsed.data.email, hash);

  try {
    const token = await createVerificationToken(userId);
    await sendVerificationEmail(parsed.data.email, token);
  } catch (error) {
    console.error("Failed to generate verification token or send email:", error);
    return { error: "Account created, but we couldn't send a verification email. Please try logging in to resend." };
  }

  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function resendVerificationAction(email: string): Promise<{ success?: string; error?: string }> {
  if (!email || !email.includes("@")) {
    return { error: "A valid email address is required." };
  }

  const user = await getUserByEmail(email);
  if (!user) {
    // Return standard success to avoid email enumeration
    return { success: "If that email is registered, we have sent a new verification link." };
  }

  if (user.email_verified) {
    return { error: "This email is already verified. Please try logging in." };
  }

  try {
    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, token);
    return { success: "A new verification link has been sent to your email." };
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return { error: "We encountered an error sending the verification email. Please try again later." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

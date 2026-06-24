"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { createUser, getUserByEmail, createVerificationCode, verifyEmailCode, upgradeGuestUser, createPasswordResetToken, verifyPasswordResetToken, resetUserPassword } from "@/lib/db";
import { sendVerificationCodeEmail, sendPasswordResetEmail } from "@/lib/email";

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
    const valid = user.password_hash.startsWith("$") ? await bcrypt.compare(parsed.data.password, user.password_hash) : false;
    if (valid && !user.email_verified) {
      redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
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
  let userId = existing?.id;
  let isUpgradingGuest = false;

  if (existing) {
    if (existing.password_hash === "NO_PASSWORD") {
      isUpgradingGuest = true;
    } else {
      return { error: "An account with that email already exists." };
    }
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  
  if (isUpgradingGuest && userId !== undefined) {
    await upgradeGuestUser(userId, parsed.data.name, hash);
  } else {
    userId = await createUser(parsed.data.name, parsed.data.email, hash);
  }

  try {
    const code = await createVerificationCode(userId);
    const success = await sendVerificationCodeEmail(parsed.data.email, code);
    if (!success) {
      throw new Error("SMTP server failed to send verification email.");
    }
  } catch (error) {
    console.error("Failed to generate verification code or send email:", error);
    return { error: "Account created, but we couldn't send a verification code. Please try logging in to request one." };
  }

  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export type VerifyCodeState = { error?: string } | undefined;

export async function verifyCodeAction(
  _prev: VerifyCodeState,
  formData: FormData
): Promise<VerifyCodeState> {
  const email = String(formData.get("email") || "").trim();
  const code = String(formData.get("code") || "").trim();

  if (!email || !code) {
    return { error: "Email and verification code are required." };
  }

  try {
    const result = await verifyEmailCode(email, code);
    if (!result.success) {
      return { error: result.error };
    }
  } catch (error) {
    console.error("Failed to verify email code:", error);
    return { error: "Failed to verify the code. Please try again." };
  }

  redirect("/login?verified=true");
}

export async function resendVerificationAction(email: string): Promise<{ success?: string; error?: string }> {
  if (!email || !email.includes("@")) {
    return { error: "A valid email address is required." };
  }

  const user = await getUserByEmail(email);
  if (!user) {
    // Return standard success to avoid email enumeration
    return { success: "If that email is registered, we have sent a new verification code." };
  }

  if (user.email_verified) {
    return { error: "This email is already verified. Please try logging in." };
  }

  try {
    const code = await createVerificationCode(user.id);
    const success = await sendVerificationCodeEmail(user.email, code);
    if (!success) {
      throw new Error("SMTP server failed to send verification email.");
    }
    return { success: "A new verification code has been sent to your email." };
  } catch (error) {
    console.error("Failed to resend verification code:", error);
    return { error: "We encountered an error sending the verification code. Please try again later." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type ForgotPasswordState = { error?: string; success?: string } | undefined;

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const token = await createPasswordResetToken(parsed.data.email);
    if (token) {
      await sendPasswordResetEmail(parsed.data.email, token);
    }
    // Return standard success to avoid email enumeration
    return { success: "If that email is registered, we have sent a password reset link." };
  } catch (error) {
    console.error("Failed to request password reset:", error);
    return { error: "An error occurred. Please try again later." };
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type ResetPasswordState = { error?: string } | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const user = await verifyPasswordResetToken(parsed.data.token);
    if (!user) {
      return { error: "This password reset link is invalid or has expired." };
    }

    const hash = await bcrypt.hash(parsed.data.password, 10);
    await resetUserPassword(user.id, hash);
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { error: "An error occurred resetting your password. Please try again." };
  }

  redirect("/login?resetSuccess=true");
}

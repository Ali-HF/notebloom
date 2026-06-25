import BloomMark from "@/components/BloomMark";
import BloomDivider from "@/components/BloomDivider";
import ResendButton from "@/components/ResendButton";
import ResendForm from "@/components/ResendForm";
import OtpForm from "@/components/OtpForm";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; upgrade?: string }>;
}) {
  const { email, upgrade } = await searchParams;
  const isUpgrade = upgrade === "true";

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center gap-3 mb-8">
        <BloomMark size={40} />
        <Link 
          href="/" 
          className="text-xl hover:opacity-80 transition-opacity font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          notebloom
        </Link>
      </div>

      <div className="bg-cream/60 border border-ink/10 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-xs">
        {email ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brass/10 text-brass animate-pulse">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="space-y-2 text-center">
              <h2 
                className="text-2xl text-ink font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {isUpgrade ? "Claim your guest account" : "Verify your email"}
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                {isUpgrade 
                  ? "We found a guest account with this email! Enter the 6-digit verification code sent to "
                  : "We have sent a 6-digit verification code to "}
                <strong className="text-ink font-semibold break-all">{email}</strong>.
              </p>
              <p className="text-xs text-ink-soft/85 leading-relaxed">
                {isUpgrade
                  ? "Enter the code below to verify your email, set your password, and claim your order history."
                  : "Please enter the code below to verify your account and log in."}
              </p>
            </div>

            <BloomDivider className="my-4" />

            <OtpForm email={email} />

            <BloomDivider className="my-4" />

            <div className="space-y-4">
              <p className="text-xs text-ink-soft/75 text-center leading-relaxed">
                Didn&apos;t get the code? Check your spam folder, or request a new one below.
              </p>
              <ResendButton email={email} />
            </div>

            <div className="pt-4 text-center">
              <Link href="/login" className="trail-link text-sm text-oxblood font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                BACK TO LOGIN
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 
                className="text-2xl text-ink font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Request a verification code
              </h2>
              <p className="text-sm text-ink-soft">
                Enter your account email below to receive a new verification code.
              </p>
            </div>

            <BloomDivider className="my-4" />

            <ResendForm />

            <div className="pt-4 text-center">
              <Link href="/login" className="trail-link text-sm text-oxblood font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                BACK TO LOGIN
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

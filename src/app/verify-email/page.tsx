import WormMark from "@/components/WormMark";
import WormDivider from "@/components/WormDivider";
import ResendButton from "@/components/ResendButton";
import ResendForm from "@/components/ResendForm";
import AutoRedirect from "@/components/AutoRedirect";
import { verifyEmail } from "@/lib/db";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  let verifyResult: { success: boolean; email?: string; error?: string } | null = null;
  if (token) {
    verifyResult = await verifyEmail(token);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center gap-3 mb-8">
        <WormMark size={40} />
        <Link 
          href="/" 
          className="text-xl hover:opacity-80 transition-opacity font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          the paperworm
        </Link>
      </div>

      <div className="bg-cream/60 border border-ink/10 rounded-2xl p-6 md:p-8 shadow-sm backdrop-blur-xs">
        {/* Case 1: Verification Result */}
        {token && verifyResult && (
          <div>
            {verifyResult.success ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss animate-pulse">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 
                    className="text-2xl text-moss font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Email Verified!
                  </h2>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    Thank you for verifying your email address. Your account is now active and ready.
                  </p>
                </div>

                <WormDivider className="my-4" />

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-block w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                              transition-colors text-sm font-semibold shadow-sm text-center"
                    style={{ fontFamily: "var(--font-stamp)" }}
                  >
                    CONTINUE TO LOG IN
                  </Link>
                </div>

                <AutoRedirect to="/login" delay={4000} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-oxblood/10 text-oxblood">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                <div className="space-y-2 text-center">
                  <h2 
                    className="text-2xl text-oxblood font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Verification Failed
                  </h2>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {verifyResult.error}
                  </p>
                </div>

                <WormDivider className="my-4" />

                <div className="space-y-4">
                  <p className="text-xs text-ink-soft font-semibold uppercase tracking-wider text-center" style={{ fontFamily: "var(--font-stamp)" }}>
                    Request a new verification link
                  </p>
                  <ResendForm />
                </div>

                <div className="pt-4 text-center">
                  <Link href="/login" className="trail-link text-sm text-oxblood font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                    BACK TO LOGIN
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case 2: Email Pending (No Token, but Email is provided) */}
        {!token && email && (
          <div className="space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brass/10 text-brass">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>

            <div className="space-y-2 text-center">
              <h2 
                className="text-2xl text-ink font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Check your inbox
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                We have sent a verification link to <strong className="text-ink font-semibold break-all">{email}</strong>.
              </p>
              <p className="text-xs text-ink-soft/80 leading-relaxed">
                Please click the link in that email within 24 hours to activate your account.
              </p>
            </div>

            <WormDivider className="my-4" />

            <div className="space-y-4">
              <p className="text-xs text-ink-soft/75 text-center leading-relaxed">
                Didn&apos;t get the email? Check your spam folder, or click below to request a new link.
              </p>
              <ResendButton email={email} />
            </div>

            <div className="pt-4 text-center">
              <Link href="/login" className="trail-link text-sm text-oxblood font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                BACK TO LOGIN
              </Link>
            </div>
          </div>
        )}

        {/* Case 3: Direct Access (No token, no email) */}
        {!token && !email && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 
                className="text-2xl text-ink font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Verify your email
              </h2>
              <p className="text-sm text-ink-soft">
                Enter your account email below to receive a new verification link.
              </p>
            </div>

            <WormDivider className="my-4" />

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

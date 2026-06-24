import WormMark from "@/components/WormMark";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verified?: string; resetSuccess?: string }>;
}) {
  const { next, verified, resetSuccess } = await searchParams;
  const isVerified = verified === "true";
  const isResetSuccess = resetSuccess === "true";

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="flex flex-col items-center gap-3 mb-8">
        <WormMark size={36} />
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Welcome back
        </h1>
      </div>
      <LoginForm next={next ?? "/account"} verified={isVerified} resetSuccess={isResetSuccess} />
    </div>
  );
}

import BloomMark from "@/components/BloomMark";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; email?: string }>;
}) {
  const { next, email } = await searchParams;

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="flex flex-col items-center gap-3 mb-8">
        <BloomMark size={36} />
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Join Notebloom
        </h1>
      </div>
      <SignupForm next={next ?? "/account"} initialEmail={email} />
    </div>
  );
}

import { AuthForm } from '@/components/auth-form';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Logo />
        <ThemeToggle compact />
      </header>
      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <div>
          {params.error === 'oauth' ? (
            <p className="mb-4 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
              GitHub didn&apos;t return a code. Try again.
            </p>
          ) : null}
          <AuthForm mode="login" next={params.next} />
        </div>
      </div>
    </main>
  );
}

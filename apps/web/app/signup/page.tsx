import { AuthForm } from '@/components/auth-form';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Logo />
        <ThemeToggle compact />
      </header>
      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}

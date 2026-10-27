import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="mt-10 text-[32px] font-semibold tracking-[-0.03em] text-fg">This page doesn&apos;t exist.</h1>
      <p className="mt-2 max-w-[48ch] text-[13px] leading-6 text-fg-muted">
        The link may be broken, or the resource is no longer available.
      </p>
      <Link href="/" className="mt-6 text-[12px] text-accent hover:underline">
        Go home
      </Link>
    </main>
  );
}

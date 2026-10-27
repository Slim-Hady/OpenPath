import Link from 'next/link';

const TABS = [
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/account', label: 'Account' },
  { href: '/settings/history', label: 'History' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/appearance', label: 'Appearance' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav aria-label="Settings" className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="border-b-2 border-transparent px-3 py-2.5 text-[13px] text-fg-muted hover:text-fg"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}

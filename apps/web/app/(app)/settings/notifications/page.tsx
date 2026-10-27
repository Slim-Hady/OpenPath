import { NotificationPreferencesPanel } from '@/components/notification-preferences';

export default function SettingsNotificationsPage() {
  return (
    <div className="max-w-[720px]">
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-fg">Notifications</h1>
      <div className="mt-6">
        <NotificationPreferencesPanel />
      </div>
    </div>
  );
}

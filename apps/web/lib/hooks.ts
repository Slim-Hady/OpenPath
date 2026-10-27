'use client';

import { useQuery } from '@tanstack/react-query';
import type { Me, NotificationList, Profile } from '@osh/contracts';
import { apiFetch, ApiError } from '@/lib/api-client';

export const queryKeys = {
  me: ['me'] as const,
  profile: ['profile'] as const,
  notifications: ['notifications'] as const,
  notificationPrefs: ['notification-preferences'] as const,
  progress: ['progress'] as const,
  achievements: ['achievements'] as const,
  savedLists: ['saved-lists'] as const,
  adminSettings: ['admin-ai-settings'] as const,
  adminMetrics: (start?: string, end?: string) => ['admin-metrics', start ?? '', end ?? ''] as const,
  adminUsage: (start?: string, end?: string) => ['admin-usage', start ?? '', end ?? ''] as const,
};

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiFetch<Me>('/me'),
    retry: false,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiFetch<Profile>('/profile'),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => apiFetch<NotificationList>('/notifications?perPage=10'),
    refetchInterval: 60_000,
  });
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

import { IssueDetail } from '@/components/issue-detail';

export default async function IssuePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <IssueDetail issueId={id} initialTab={tab} />;
}

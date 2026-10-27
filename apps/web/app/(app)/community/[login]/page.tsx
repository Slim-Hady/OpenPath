import { ContributorDetailView } from '@/components/contributor-detail';

export default async function ContributorPage({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  return <ContributorDetailView login={login} />;
}

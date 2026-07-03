import { PageHeader } from '@/components/company/PageHeader';
import { Card } from '@/components/company/Card';

// Stub Overview page — Task 15 fills in the real dashboard (stat cards, charts, etc.).
export default function CompanyOverviewPage() {
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-7">
      <PageHeader title="Overview" subtitle="Your company dashboard at a glance." />
      <Card className="p-6 text-sm text-muted">Dashboard coming soon.</Card>
    </div>
  );
}

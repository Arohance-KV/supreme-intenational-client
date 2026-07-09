import DcWordmark from '@/components/DcWordmark';

export default function EmployeeFooter() {
  return (
    <footer className="font-display mt-16 border-t border-[rgba(19,184,159,.18)] bg-[rgba(232,247,244,.5)] py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center">
        <DcWordmark />
        <p className="mt-3 text-sm text-slate">Merchandise portal powered by Supreme International</p>
        <p className="mt-1 text-sm text-muted">
          Need help?{' '}
          <a href="mailto:support@supremegifts.in" className="font-medium text-accent hover:underline">
            support@supremegifts.in
          </a>
        </p>
      </div>
    </footer>
  );
}

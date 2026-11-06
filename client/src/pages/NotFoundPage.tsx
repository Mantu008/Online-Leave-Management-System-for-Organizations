import { ArrowLeft, Compass } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-600">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-[15px] text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <ButtonLink to="/dashboard" className="mt-8" icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
        Back to dashboard
      </ButtonLink>
    </div>
  );
}

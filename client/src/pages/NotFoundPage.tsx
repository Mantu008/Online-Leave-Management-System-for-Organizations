import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';

export default function NotFoundPage() {
  return (
    <EmptyState
      className="min-h-[50vh]"
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={
        <ButtonLink to="/dashboard" variant="secondary">
          Back to dashboard
        </ButtonLink>
      }
    />
  );
}

import { useState } from 'react';
import { PartyPopper } from 'lucide-react';
import { holidaysApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { HolidayTable, YearSwitcher } from '../../components/holidays/HolidayTable';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { PageHeader, Panel } from '../../components/ui/Layout';

export default function HolidaysPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, loading, error, reload } = useAsync(() => holidaysApi.list(year), [year]);

  return (
    <>
      <PageHeader title="Holidays" description="Company and public holidays. Leave can't be requested on these dates." />
      <Panel title={`${year} holidays`} actions={<YearSwitcher year={year} onChange={setYear} />}>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={PartyPopper} title={`No holidays published for ${year}`} description="Check back later or try another year." />
        ) : (
          <HolidayTable holidays={data} />
        )}
      </Panel>
    </>
  );
}

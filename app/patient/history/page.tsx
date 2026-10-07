import DashboardLayout from '@/frontend/components/DashboardLayout';
import PatientHistory from '@/frontend/modules/patient/components/PatientHistory';

export default function PatientHistoryPage() {
  return (
    <DashboardLayout role="patient">
      <PatientHistory />
    </DashboardLayout>
  );
}

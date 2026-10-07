import DashboardLayout from '@/frontend/components/DashboardLayout';
import PatientDashboard from '@/frontend/modules/patient/components/PatientDashboard';

export default function PatientDashboardPage() {
  return (
    <DashboardLayout role="patient">
      <PatientDashboard />
    </DashboardLayout>
  );
}

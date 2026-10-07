import DashboardLayout from '@/frontend/components/DashboardLayout';
import PatientPrescriptions from '@/frontend/modules/patient/components/PatientPrescriptions';

export default function PatientPrescriptionsPage() {
  return (
    <DashboardLayout role="patient">
      <PatientPrescriptions />
    </DashboardLayout>
  );
}

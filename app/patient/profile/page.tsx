import DashboardLayout from '@/frontend/components/DashboardLayout';
import PatientProfile from '@/frontend/modules/patient/components/PatientProfile';

export default function PatientProfilePage() {
  return (
    <DashboardLayout role="patient">
      <PatientProfile />
    </DashboardLayout>
  );
}

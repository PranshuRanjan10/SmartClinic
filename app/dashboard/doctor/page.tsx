import DashboardLayout from '@/frontend/components/DashboardLayout';
import DoctorDashboard from '@/frontend/modules/doctor/components/DoctorDashboard';

export default function DoctorDashboardPage() {
  return (
    <DashboardLayout role="doctor">
      <DoctorDashboard />
    </DashboardLayout>
  );
}

import DashboardLayout from '@/frontend/components/DashboardLayout';
import PharmacistDashboard from '@/frontend/modules/pharmacist/components/PharmacistDashboard';

export default function PharmacistDashboardPage() {
  return (
    <DashboardLayout role="pharmacist">
      <PharmacistDashboard />
    </DashboardLayout>
  );
}

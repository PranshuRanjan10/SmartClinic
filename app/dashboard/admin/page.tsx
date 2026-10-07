import DashboardLayout from '@/frontend/components/DashboardLayout';
import AdminDashboard from '@/frontend/modules/admin/components/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <DashboardLayout role="admin">
      <AdminDashboard />
    </DashboardLayout>
  );
}

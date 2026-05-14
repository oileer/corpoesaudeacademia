import DashboardStats from '@/components/admin/DashboardStats'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Visão geral da academia</p>
      </div>
      <DashboardStats />
    </div>
  )
}

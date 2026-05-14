import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* pt-16 = header mobile; pb-20 = bottom nav mobile; md: sem padding extra */}
      <main className="flex-1 overflow-auto pt-16 pb-20 p-4">
        {children}
      </main>
    </div>
  )
}

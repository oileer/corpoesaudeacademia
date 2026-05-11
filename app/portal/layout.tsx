import BottomNav from '@/components/portal/BottomNav'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-lg mx-auto">{children}</main>
      <BottomNav />
    </div>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-teal mb-2">404</p>
        <h1 className="font-heading font-bold text-2xl text-gray-900 mb-3">Page not found</h1>
        <p className="text-slate mb-8">This page does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber text-white font-semibold px-6 py-3 rounded-md hover:bg-amber-dark transition-colors"
        >
          Back to home →
        </Link>
      </div>
    </div>
  )
}

/**
 * Admin Dashboard Page
 * Main dashboard for admin panel
 */

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Products Card */}
        <Link
          href="/admin/products"
          className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <p className="text-sm text-gray-600">Manage product catalog</p>
            </div>
          </div>
        </Link>

        {/* More cards can be added here in future sprints */}
      </div>
    </div>
  );
}

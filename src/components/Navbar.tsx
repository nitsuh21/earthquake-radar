'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-black text-lg font-bold">
              EQ Radar
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              href="/alerts"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === '/alerts'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              Alerts
              {/* Add alert indicator if there are active alerts */}
              <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                !
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole); // Set role to state for rendering
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = async () => {
    try {
      // Call backend to clear the session
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include', // Include session cookie
      });

      if (!response.ok) {
        console.error('Logout failed:', response.statusText);
      }

      // Clear localStorage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('role'); // Clear role as well
      setIsDropdownOpen(false); // Close dropdown
      router.push('/'); // Redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Determine if the current route matches the link
  const getLinkClass = (path: string) => {
    return router.pathname === path ? 'text-[#a40000]' : 'text-black';
  };

  return (
    <nav className="w-full fixed top-0 left-0 flex items-center justify-between p-4 bg-white shadow-md lg:py-2 z-50">
      {/* Logo Section */}
      <div className="flex items-center space-x-4">
        <img loading="eager" src="/logo.svg" className="w-24" alt="Logo" />
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="block lg:hidden">
        <FaBars
          className="text-2xl text-black hover:text-red-600 cursor-pointer"
          onClick={toggleDrawer}
        />
      </div>

      {/* Links for Desktop */}
      <div className="hidden lg:flex flex-1 justify-center space-x-8 font-roboto font-bold text-lg">
        {/* Conditionally render links based on role */}
        {role === 'admin' && (
          <>
            <Link href="/dashboard" className={`${getLinkClass('/dashboard')} hover:text-red-600`}>
              Dashboard
            </Link>
            <Link href="/user-management" className={`${getLinkClass('/user-management')} hover:text-red-600`}>
              User Management
            </Link>
          </>
        )}
        <Link href="/report" className={`${getLinkClass('/report')} hover:text-red-600`}>
          Report
        </Link>
        <Link href="/history" className={`${getLinkClass('/history')} hover:text-red-600`}>
          History
        </Link>
      </div>

      {/* User Icon */}
      <div className="relative hidden lg:block">
        <FaUserCircle
          className="text-2xl text-black hover:text-red-600 cursor-pointer"
          onClick={toggleDropdown}
        />
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg font-roboto">
            <button
              className="block w-full text-left px-4 py-2 text-black hover:bg-gray-300"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Drawer for Mobile */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between px-4 py-4">
              <img loading="eager" src="/logo.svg" className="w-20" alt="Logo" />
              <IoClose
                className="text-2xl text-black hover:text-red-600 cursor-pointer"
                onClick={toggleDrawer}
              />
            </div>
            <div className="flex-1 flex flex-col font-roboto font-bold text-lg">
              {role === 'admin' && (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-black hover:bg-gray-200 hover:text-red-600"
                    onClick={toggleDrawer}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/user-management"
                    className="px-4 py-2 text-black hover:bg-gray-200 hover:text-red-600"
                    onClick={toggleDrawer}
                  >
                    User Management
                  </Link>
                </>
              )}
              <Link
                href="/report"
                className="px-4 py-2 text-black hover:bg-gray-200 hover:text-red-600"
                onClick={toggleDrawer}
              >
                Report
              </Link>
              <Link
                href="/history"
                className="px-4 py-2 text-black hover:bg-gray-200 hover:text-red-600"
                onClick={toggleDrawer}
              >
                History
              </Link>
            </div>
            <button
              className="block w-full text-left px-4 py-2 text-black hover:bg-gray-300 hover:text-red-600"
              onClick={() => {
                toggleDrawer();
                handleLogout();
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

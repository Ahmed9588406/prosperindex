"use client";

import { useState } from "react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from "next/link";
import CategoryNavigation from './categories/CategoryNavigation';

type Category = {
  name: string;
  fields: { name: string; description: string; path?: string }[];
};

interface ClientLayoutProps {
  children: React.ReactNode;
  categories: Category[];
}

export default function ClientLayout({ children, categories }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar with CategoryNavigation */}
      <aside style={{ 
        width: isSidebarOpen ? '320px' : '0', 
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        transition: 'width 0.3s ease-out',
        overflowX: 'hidden'
      }}>
        <div style={{ width: '320px' }}>
          <CategoryNavigation categories={categories} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0 
      }}>
        <div className="flex justify-between items-center p-4" style={{ 
          borderBottom: '1px solid #e2e8f0',
          background: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              Categories
            </button>
            <Link href="/">
              <Image 
                src="/assets/AI_PAT.jpg" 
                alt="AI PAT" 
                width={50} 
                height={50} 
                className="rounded-full"
                draggable={false}
              />
            </Link>
          </div>
          <div>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

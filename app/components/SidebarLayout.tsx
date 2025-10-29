"use client";

import { useState, useEffect } from "react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from "next/link";
import { Menu, X, History } from 'lucide-react';
import CategoryNavigation from '../categories/CategoryNavigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

type Category = {
  name: string;
  fields: { name: string; description: string; path?: string }[];
};

interface SidebarLayoutProps {
  categories: Category[];
  children: React.ReactNode;
}

export default function SidebarLayout({ categories, children }: SidebarLayoutProps) {
  const t = useTranslations('navigation');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Toggle body scroll lock
    if (!isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  };

  // Close mobile menu when clicking overlay
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.classList.remove('mobile-menu-open');
  };

  return (
    <>
      <style jsx global>{`
        body.mobile-menu-open {
          overflow: hidden;
          position: fixed;
          width: 100%;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease-out;
          backdrop-filter: blur(2px);
        }

        .mobile-overlay.show {
          display: block;
          opacity: 1;
        }

        @media (max-width: 768px) {
          .sidebar-container {
            position: fixed !important;
            top: 0;
            left: 0;
            width: 85%;
            max-width: 350px;
            height: 100vh;
            height: 100dvh;
            z-index: 1001;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
            overflow-y: auto;
          }

          .sidebar-container.mobile-open {
            transform: translateX(0);
          }

          .desktop-sidebar-toggle {
            display: none !important;
          }

          .mobile-menu-toggle {
            display: flex !important;
          }

          .main-content {
            width: 100% !important;
            padding: 16px !important;
            padding-bottom: 100px !important;
          }

          .top-bar {
            padding: 12px 16px !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-toggle {
            display: none !important;
          }

          .mobile-overlay {
            display: none !important;
          }
        }

        .mobile-menu-toggle {
          display: none;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: calc(100% - 40px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
          transition: transform 0.2s, box-shadow 0.2s;
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999;
        }

        .mobile-menu-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
        }

        .mobile-menu-toggle:active {
          transform: translateY(0);
        }

        .hamburger-icon {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 24px;
        }

        .hamburger-icon span {
          display: block;
          width: 100%;
          height: 3px;
          background: white;
          border-radius: 2px;
          transition: transform 0.3s, opacity 0.3s;
        }

        .mobile-menu-open .hamburger-icon span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .mobile-menu-open .hamburger-icon span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-open .hamburger-icon span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .history-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          position: relative;
          overflow: hidden;
        }

        .history-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .history-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }

        .history-button:hover::before {
          left: 100%;
        }

        .history-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
        }

        .history-icon {
          width: 18px;
          height: 18px;
          animation: rotate 2s linear infinite;
          animation-play-state: paused;
        }

        .history-button:hover .history-icon {
          animation-play-state: running;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .history-button {
            padding: 8px 16px;
            font-size: 13px;
          }

          .history-icon {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile Overlay */}
        <div 
          className={`mobile-overlay ${isMobileMenuOpen ? 'show' : ''}`}
          onClick={closeMobileMenu}
        />

        {/* Sidebar with CategoryNavigation */}
        <aside 
          className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          style={{ 
            width: isMobile ? '85%' : (isSidebarOpen ? '320px' : '0'),
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            background: 'white'
          }}
        >
          <CategoryNavigation 
            categories={categories} 
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={closeMobileMenu}
          />
        </aside>

        {/* Main Content Area */}
        <main className="main-content" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0 
        }}>
          <div className="top-bar" style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Desktop Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="desktop-sidebar-toggle"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                }}
                title={isSidebarOpen ? t('hideSidebar') : t('showSidebar')}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link href="/">
                <Image 
                  src="/assets/AI_PAT.jpg" 
                  alt="AI PAT" 
                  width={50} 
                  height={50} 
                  style={{ borderRadius: '50%' }}
                  draggable={false}
                />
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/history">
                <button className="history-button">
                  <History className="history-icon" />
                  <span>{t('history')}</span>
                </button>
              </Link>
              <LanguageSwitcher />
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

        {/* Mobile Menu Toggle Button */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>{isMobileMenuOpen ? t('closeMenu') : t('openMenu')}</span>
        </button>
      </div>
    </>
  );
}
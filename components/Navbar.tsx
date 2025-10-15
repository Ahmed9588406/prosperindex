"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, History, MapPin } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function ModernNavbar({ 
  isSidebarOpen, 
  setIsSidebarOpen 
}: { 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> 
}): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { name: 'History', id: 'history', icon: History },
    { name: 'Cities', id: 'cities', icon: MapPin },
  ];

  const router = useRouter();

  const handleNavClick = (id: string) => {
    setActiveLink(id);
    router.push(`/${id}`);
  };

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(6, 182, 212, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.7), 0 0 60px rgba(6, 182, 212, 0.5);
          }
        }

        .nav-button {
          position: relative;
          overflow: hidden;
        }

        .nav-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .nav-button:hover::before {
          left: 100%;
        }

        .logo-container {
          animation: float 3s ease-in-out infinite;
        }

        .logo-icon {
          animation: glow 2s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #06b6d4, #a855f7, #ec4899, #f97316);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .mobile-menu-enter {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .glass-morphism-light {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div className={isScrolled ? 'glass-morphism' : 'glass-morphism-light'} style={{
          boxShadow: isScrolled 
            ? '0 10px 40px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1) inset' 
            : 'none',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 1.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '80px',
            }}>
              {/* Sidebar Toggle and Logo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                {!isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="nav-button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: 'white',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                    title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                  >
                    {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                )}
                
                <div className="logo-container" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}>
                  <div className="logo-icon" style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                    padding: '10px',
                    borderRadius: '12px',
                  }}>
                    <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="gradient-text" style={{
                      fontSize: isMobile ? '1.25rem' : '1.75rem',
                      fontWeight: '800',
                      letterSpacing: '-0.5px',
                    }}>
                      AI-PAT
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      letterSpacing: '1px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                    }}>
                      Powered by AI
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.05)',
                  padding: '6px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeLink === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className="nav-button"
                        style={{
                          position: 'relative',
                          padding: '12px 24px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          border: 'none',
                          cursor: 'pointer',
                          background: isActive 
                            ? 'linear-gradient(135deg, #7c2d12 0%, #b91c1c 50%, #dc2626 100%)'
                            : 'transparent',
                          color: 'black',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: isActive ? '0 4px 20px rgba(124, 45, 18, 0.4)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.color = 'black';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'black';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <Icon style={{ width: '18px', height: '18px' }} />
                        <span>{item.name}</span>
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'white',
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* User Button and CTA */}
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div style={{
                    padding: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10"
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{
                    color: 'white',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && isMobile && (
            <div className="mobile-menu-enter glass-morphism" style={{
              padding: '1.5rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.75rem' 
              }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeLink === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavClick(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive 
                          ? 'linear-gradient(135deg, #7c2d12 0%, #b91c1c 50%, #dc2626 100%)'
                          : 'rgba(0, 0, 0, 0.05)',
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.3s ease',
                        boxShadow: isActive ? '0 4px 20px rgba(124, 45, 18, 0.3)' : 'none',
                      }}
                    >
                      <Icon style={{ width: '22px', height: '22px' }} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                  }}>
                    Your Account
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Welcome to AI-PAT - Your AI-Powered Analytics Platform",
}

export default function WelcomePage() {
  return (
    <main className="relative flex justify-center items-center min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient" />
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/pxfuel.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
        }}
      />

      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
          
          {/* Logo/Image Section */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-75 group-hover:opacity-100 blur-2xl transition duration-1000 group-hover:duration-200 animate-pulse" />
            
            {/* Image Container */}
            <div className="relative">
              <Image 
                src="/assets/cpi.png" 
                className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
                  transition-all duration-500 
                  group-hover:scale-110 group-hover:rotate-3
                  drop-shadow-2xl" 
                alt="AI-PAT city icon" 
                width={384} 
                height={384}
                draggable={false}
                priority
              />
              
              {/* Floating Particles */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-75" />
              <div className="absolute bottom-10 left-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75 animation-delay-1000" />
            </div>
          </div>

          {/* Text Content Section */}
          <div className="flex flex-col items-center lg:items-start gap-8 text-center lg:text-left max-w-xl">
            
            

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-jura">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                  AI-PAT
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/80 font-light leading-relaxed">
                Transform urban data into
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 font-semibold">
                  actionable insights
                </span>
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg max-w-md leading-relaxed">
              Harness the power of artificial intelligence to analyze, predict, and optimize urban development across multiple indices.
            </p>

            {/* CTA Button */}
            <Link href="/cities" className="w-full sm:w-auto group">
              <Button 
                size="lg"
                className="relative w-full sm:w-auto px-12 py-7 text-lg font-semibold
                  bg-gradient-to-r from-purple-600 to-blue-600 
                  hover:from-purple-500 hover:to-blue-500
                  text-white rounded-full
                  transition-all duration-300
                  hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50
                  border-2 border-white/20
                  overflow-hidden"
              >
                {/* Button Shine Effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="relative flex items-center gap-3">
                  Let&apos;s Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            {/* Features List */}
            <div className="flex flex-wrap gap-4 pt-4">
              {['Real-time Analytics', 'Smart Insights'].map((feature) => (
                <div 
                  key={feature}
                  className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-scroll" />
        </div>
      </div>
    </main>
  );
}
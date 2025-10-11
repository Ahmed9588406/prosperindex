"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Building2, 
  Heart, 
  Users, 
  Leaf, 
  Scale 
} from "lucide-react";

const HomePage = () => {
  const router = useRouter();

  const cards = [
    {
      id: 1,
      title: "Productivity Index",
      description: "Track and analyze productivity metrics across your organization",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      route: "/home/P",
      image: "/assets/Screenshot 2025-01-12 212420.png"
    },
    {
      id: 2,
      title: "Infrastructure Index",
      description: "Monitor infrastructure development and maintenance",
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      route: "/home/ID",
      image: "/assets/infrastructure.png"
    },
    {
      id: 3,
      title: "Quality of Life Index",
      description: "Measure community well-being and living standards",
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      route: "/home/QOL",
      image: "/assets/quality.png"
    },
    {
      id: 4,
      title: "Equity and Social Inclusion",
      description: "Assess social equity and inclusion initiatives",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      route: "/home/ESI",
      image: "/assets/equality.png"
    },
    {
      id: 5,
      title: "Environmental Sustainability",
      description: "Evaluate environmental impact and sustainability efforts",
      icon: Leaf,
      color: "from-green-500 to-green-600",
      route: "/home/ES",
      image: "/assets/environment.png"
    },
    {
      id: 6,
      title: "Governance & Legislation",
      description: "Review governance frameworks and legislative compliance",
      icon: Scale,
      color: "from-indigo-500 to-indigo-600",
      route: "/home/UGL",
      image: "/assets/Urban.png"
    }
  ];

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Urban Development
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Analytics Dashboard
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive insights into city development across multiple indices
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.route)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Card content */}
                <div className="relative p-6">
                  {/* Icon container */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Optional image */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md ring-2 ring-white group-hover:ring-4 transition-all duration-300">
                      <img 
                        src={card.image} 
                        alt={card.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Text content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {card.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore</span>
                    <svg 
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-blue-400 transition-all duration-300" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats section (optional) */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
              <div className="text-gray-600">Key Indices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">Real-time</div>
              <div className="text-gray-600">Data Analytics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">360°</div>
              <div className="text-gray-600">Comprehensive View</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
"use client";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const features = [
    {
      title: "Currency Converter",
      description: "Convert between different currencies with real-time exchange rates",
      icon: "💱",
      href: "/currency",
      color: "from-blue-500 to-blue-600",
      available: true
    },
    {
      title: "Alpha Vantage",
      description: "Stock market data and financial analytics",
      icon: "📈",
      href: "/alpha-vantage",
      color: "from-green-500 to-green-600",
      available: false
    },
    {
      title: "More Features",
      description: "Additional tools coming soon",
      icon: "🚀",
      href: "#",
      color: "from-purple-500 to-purple-600",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="hover:scale-105 transition-transform cursor-pointer">
              <Image
                src="/favicon.ico"
                alt="Trade Tools Logo"
                width={64}
                height={64}
                className="rounded-lg shadow-lg"
              />
            </Link>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Trade Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your one-stop destination for currency conversion, stock analysis, and financial data
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group">
              {feature.available ? (
                <Link href={feature.href} className="block">
                  <FeatureCard feature={feature} />
                </Link>
              ) : (
                <div className="cursor-not-allowed">
                  <FeatureCard feature={feature} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Trade Tools</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: any }) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300
      ${feature.available 
        ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' 
        : 'opacity-60 cursor-not-allowed'
      }
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
    `}>
      {/* Status Badge */}
      {!feature.available && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
            Coming Soon
          </span>
        </div>
      )}

      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}></div>
      
      <div className="relative p-8">
        {/* Icon */}
        <div className="text-6xl mb-4">{feature.icon}</div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {feature.description}
        </p>
        
        {/* Action Indicator */}
        {feature.available && (
          <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
            Explore <span className="ml-2">→</span>
          </div>
        )}
      </div>
    </div>
  );
}
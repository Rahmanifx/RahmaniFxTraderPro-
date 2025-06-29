import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, Users, Zap } from "lucide-react";
import logoImage from "@assets/AEDDA87E-A633-4C77-9425-72E06AFB9F95_1750955390491.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <header className="relative pt-6">
              <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
                <div className="flex items-center">
                  <img src={logoImage} alt="Rahmani FX Trader Pro" className="h-12 w-auto mr-3" />
                  <span className="text-2xl font-bold text-gray-900">Rahmani FX Trader Pro</span>
                </div>
              </nav>
            </header>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Professional</span>
                  <span className="block text-primary xl:inline"> Forex Trading</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join the elite community of forex traders. Compete in tournaments, access real-time market data, and grow your trading skills with our professional-grade platform.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start space-x-4">
                  <div className="rounded-md shadow">
                    <Button
                      size="lg"
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      Start Trading Now
                    </Button>
                  </div>
                  <div className="rounded-md shadow">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                      onClick={() => window.location.href = "/funding"}
                    >
                      Get Funded Account
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Real-time Trading</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Access live currency pair prices with instant execution and professional-grade charts.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Trading Tournaments</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Compete with other traders in exciting tournaments and climb the leaderboard.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Platform</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Enterprise-grade security with encrypted data and secure authentication.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Lightning Fast</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Ultra-low latency execution and real-time market data updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start trading?</span>
            <span className="block">Join thousands of successful traders.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Get started with our professional forex trading platform today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
}

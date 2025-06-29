import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import NavigationHeader from "@/components/navigation-header";
import AccountOverview from "@/components/account-overview";
import CurrencyPairsTable from "@/components/currency-pairs-table";
import QuickTrade from "@/components/quick-trade";
import TournamentLeaderboard from "@/components/tournament-leaderboard";
import SubscriptionPlans from "@/components/subscription-plans";
import LiveAccountTracker from "@/components/live-account-tracker";
import MobileNavigation from "@/components/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData, isLoading: isDashboardLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: currencyPairs, isLoading: isPairsLoading } = useQuery({
    queryKey: ["/api/currency-pairs"],
  });

  const { data: tradingPlans, isLoading: isPlansLoading } = useQuery({
    queryKey: ["/api/trading-plans"],
  });

  // Handle errors
  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Session Expired",
      description: "Please log in again.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  if (isDashboardLoading || isPairsLoading || isPlansLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="pt-16">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="pt-16 pb-16 lg:pb-0">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Trading Dashboard</h1>
            
            <AccountOverview 
              user={dashboardData?.user}
              participantData={dashboardData?.participantData}
              activeTournament={dashboardData?.activeTournament}
            />
          </div>

          {/* Live Funded Accounts Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Live Funded Accounts</h2>
              <a href="/funding" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Apply for Funding →
              </a>
            </div>
            <LiveAccountTracker userId={dashboardData?.user?.id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <CurrencyPairsTable currencyPairs={currencyPairs || []} />
            </div>
            <div className="space-y-6">
              <QuickTrade currencyPairs={currencyPairs || []} />
            </div>
          </div>

          {dashboardData?.activeTournament && (
            <TournamentLeaderboard
              tournament={dashboardData.activeTournament}
              leaderboard={dashboardData.leaderboard || []}
              currentUserId={dashboardData.user?.id}
            />
          )}

          <SubscriptionPlans plans={tradingPlans || []} />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

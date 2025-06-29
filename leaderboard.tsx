import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import MobileNavigation from "@/components/mobile-navigation";

export default function Leaderboard() {
  const { data: fundedTraders, isLoading: loadingFunded } = useQuery({
    queryKey: ['/api/leaderboard/funded-traders'],
  });

  const { data: tournament } = useQuery({
    queryKey: ['/api/tournaments/active'],
  });

  const { data: tournamentLeaderboard, isLoading: loadingTournament } = useQuery({
    queryKey: ['/api/tournaments', tournament?.id, 'participants'],
    enabled: !!tournament?.id,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Trader Leaderboard</h1>
          <p className="text-gray-600">Top performing traders across all categories</p>
        </div>

        <Tabs defaultValue="funded" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="funded" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Funded Traders</span>
              <span className="sm:hidden">Funded</span>
            </TabsTrigger>
            <TabsTrigger value="tournament" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Tournament</span>
              <span className="sm:hidden">Contest</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funded" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Top Funded Traders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFunded ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : fundedTraders && fundedTraders.length > 0 ? (
                  <div className="space-y-4">
                    {fundedTraders.map((trader: any, index: number) => {
                      const profit = parseFloat(trader.currentBalance) - parseFloat(trader.initialBalance);
                      const profitPercentage = (profit / parseFloat(trader.initialBalance)) * 100;
                      
                      return (
                        <div key={trader.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(index + 1)}
                          </div>
                          
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={trader.user.profileImageUrl} />
                            <AvatarFallback>
                              {getInitials(trader.user.firstName, trader.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {trader.user.firstName && trader.user.lastName 
                                    ? `${trader.user.firstName} ${trader.user.lastName}`
                                    : trader.user.email?.split('@')[0] || 'Anonymous'
                                  }
                                </p>
                                <p className="text-xs text-gray-500">{trader.accountType} Account</p>
                              </div>
                              
                              <div className="flex flex-col sm:items-end mt-1 sm:mt-0">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={profit > 0 ? "default" : "destructive"} className="text-xs">
                                    {profit > 0 ? '+' : ''}${profit.toLocaleString()}
                                  </Badge>
                                  <span className={`text-sm font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {profitPercentage.toFixed(2)}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Balance: ${parseFloat(trader.currentBalance).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No funded traders data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournament" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Tournament Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!tournament ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active tournament</p>
                  </div>
                ) : loadingTournament ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : tournamentLeaderboard && tournamentLeaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {tournamentLeaderboard.map((participant: any, index: number) => {
                      const profit = parseFloat(participant.totalPnl);
                      const profitPercentage = (profit / parseFloat(participant.initialBalance)) * 100;
                      
                      return (
                        <div key={participant.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(participant.rank || index + 1)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  Trader #{participant.userId.slice(-4)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex flex-col sm:items-end mt-1 sm:mt-0">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={profit > 0 ? "default" : "destructive"} className="text-xs">
                                    {profit > 0 ? '+' : ''}${profit.toLocaleString()}
                                  </Badge>
                                  <span className={`text-sm font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {profitPercentage.toFixed(2)}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Balance: ${parseFloat(participant.currentBalance).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tournament participants</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNavigation />
    </div>
  );
}
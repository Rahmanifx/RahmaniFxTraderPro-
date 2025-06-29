import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign } from "lucide-react";
import fundingLogo from "@assets/4A0A9B78-2BE5-4714-8558-6E9854D782EF_1750955407498.png";

export default function Funding() {
  const handlePayOnline = () => {
    // TODO: Implement online payment with crypto
    console.log("Redirecting to payment gateway");
  };

  const handleReceiveFunded = () => {
    // TODO: Implement funded account process
    console.log("Starting funded account application");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-8">
            <img src={fundingLogo} alt="Rahmani Funded FX" className="max-w-md w-full h-auto" />
          </div>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Button 
              variant="outline" 
              className="bg-transparent border-cyan-400 text-white hover:bg-cyan-400/20"
            >
              Sign Up
            </Button>
            <Button 
              variant="outline"
              className="bg-transparent border-cyan-400 text-white hover:bg-cyan-400/20"
            >
              Login
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-8">
            Choose a Funded Account Plan
          </h1>
        </div>

        {/* Funding Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card 
            className="bg-slate-800/50 border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer group"
            onClick={handlePayOnline}
          >
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-lg bg-cyan-400/20 group-hover:bg-cyan-400/30 transition-colors">
                  <CreditCard className="h-12 w-12 text-cyan-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Pay Online or<br />with Crypto
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-slate-800/50 border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer group"
            onClick={handleReceiveFunded}
          >
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-lg bg-cyan-400/20 group-hover:bg-cyan-400/30 transition-colors">
                  <DollarSign className="h-12 w-12 text-cyan-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Receive<br />Funded Account
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xl text-white/80">
            Founder: <span className="text-cyan-400 font-semibold">Rahmani Group</span>
          </p>
        </div>

        {/* Back to Trading Platform */}
        <div className="text-center mt-12">
          <Button 
            variant="outline"
            className="bg-transparent border-white/30 text-white hover:bg-white/10"
            onClick={() => window.location.href = "/"}
          >
            Back to Trading Platform
          </Button>
        </div>
      </div>
    </div>
  );
}
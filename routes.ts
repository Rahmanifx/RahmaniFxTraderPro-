import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTradingPositionSchema, insertCurrencyPairSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = await storage.getUserDashboardData(userId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Currency pairs
  app.get('/api/currency-pairs', async (req, res) => {
    try {
      const pairs = await storage.getCurrencyPairs();
      res.json(pairs);
    } catch (error) {
      console.error("Error fetching currency pairs:", error);
      res.status(500).json({ message: "Failed to fetch currency pairs" });
    }
  });

  // Trading plans
  app.get('/api/trading-plans', async (req, res) => {
    try {
      const plans = await storage.getTradingPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching trading plans:", error);
      res.status(500).json({ message: "Failed to fetch trading plans" });
    }
  });

  // Tournament leaderboard
  app.get('/api/tournament/:id/leaderboard', async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const leaderboard = await storage.getTournamentParticipants(tournamentId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Create trading position
  app.post('/api/positions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const positionData = insertTradingPositionSchema.parse({
        ...req.body,
        userId,
      });
      
      const position = await storage.createPosition(positionData);
      res.json(position);
    } catch (error) {
      console.error("Error creating position:", error);
      res.status(500).json({ message: "Failed to create position" });
    }
  });

  // Close trading position
  app.put('/api/positions/:id/close', isAuthenticated, async (req: any, res) => {
    try {
      const positionId = parseInt(req.params.id);
      const { closePrice } = req.body;
      
      const position = await storage.closePosition(positionId, closePrice);
      res.json(position);
    } catch (error) {
      console.error("Error closing position:", error);
      res.status(500).json({ message: "Failed to close position" });
    }
  });

  // Get user positions
  app.get('/api/positions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const positions = await storage.getUserPositions(userId);
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  // Join tournament
  app.post('/api/tournament/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournamentId = parseInt(req.params.id);
      
      const tournament = await storage.getActiveTournament();
      if (!tournament) {
        return res.status(404).json({ message: "No active tournament found" });
      }

      const participant = await storage.joinTournament({
        tournamentId,
        userId,
        initialBalance: tournament.initialBalance,
        currentBalance: tournament.initialBalance,
        totalPnl: "0",
      });

      res.json(participant);
    } catch (error) {
      console.error("Error joining tournament:", error);
      res.status(500).json({ message: "Failed to join tournament" });
    }
  });

  // Funded Accounts API Routes
  app.get('/api/funded-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getUserFundedAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching funded accounts:", error);
      res.status(500).json({ message: "Failed to fetch funded accounts" });
    }
  });

  app.post('/api/funded-accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accountData = { ...req.body, userId };
      const account = await storage.createFundedAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating funded account:", error);
      res.status(500).json({ message: "Failed to create funded account" });
    }
  });

  app.get('/api/funded-accounts/:id/performance', isAuthenticated, async (req: any, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const performance = await storage.getFundedAccountPerformance(accountId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching account performance:", error);
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  app.get('/api/leaderboard/funded-traders', async (req, res) => {
    try {
      const topTraders = await storage.getTopFundedTraders();
      res.json(topTraders);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time price updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send initial currency pairs data
    storage.getCurrencyPairs().then(pairs => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'currency-pairs', data: pairs }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Simulate real-time price updates
  setInterval(async () => {
    try {
      const pairs = await storage.getCurrencyPairs();
      
      // Update prices with small random changes
      for (const pair of pairs) {
        const bidChange = (Math.random() - 0.5) * 0.001;
        const askChange = (Math.random() - 0.5) * 0.001;
        
        const newBid = (parseFloat(pair.bid) + bidChange).toFixed(5);
        const newAsk = (parseFloat(pair.ask) + askChange).toFixed(5);
        const change = bidChange.toFixed(5);
        const changePercent = ((bidChange / parseFloat(pair.bid)) * 100).toFixed(2);

        await storage.updateCurrencyPair(pair.id, {
          bid: newBid,
          ask: newAsk,
          change,
          changePercent,
        });
      }

      // Broadcast updated prices to all connected clients
      const updatedPairs = await storage.getCurrencyPairs();
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'currency-pairs', data: updatedPairs }));
        }
      });
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }, 5000); // Update every 5 seconds

  return httpServer;
}

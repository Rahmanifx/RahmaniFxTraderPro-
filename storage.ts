import {
  users,
  tradingPlans,
  currencyPairs,
  tournaments,
  tournamentParticipants,
  tradingPositions,
  type User,
  type UpsertUser,
  type TradingPlan,
  type InsertTradingPlan,
  type CurrencyPair,
  type InsertCurrencyPair,
  type Tournament,
  type InsertTournament,
  type TournamentParticipant,
  type InsertTournamentParticipant,
  type TradingPosition,
  type InsertTradingPosition,
  fundedAccounts,
  type FundedAccount,
  type InsertFundedAccount,
  accountPerformance,
  type AccountPerformance,
  type InsertAccountPerformance,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trading Plans
  getTradingPlans(): Promise<TradingPlan[]>;
  getTradingPlan(id: number): Promise<TradingPlan | undefined>;
  createTradingPlan(plan: InsertTradingPlan): Promise<TradingPlan>;
  
  // Currency Pairs
  getCurrencyPairs(): Promise<CurrencyPair[]>;
  getCurrencyPair(id: number): Promise<CurrencyPair | undefined>;
  updateCurrencyPair(id: number, data: Partial<InsertCurrencyPair>): Promise<CurrencyPair>;
  
  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getActiveTournament(): Promise<Tournament | undefined>;
  getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]>;
  joinTournament(data: InsertTournamentParticipant): Promise<TournamentParticipant>;
  updateParticipantBalance(participantId: number, balance: string, pnl: string): Promise<void>;
  
  // Trading Positions
  getUserPositions(userId: string): Promise<TradingPosition[]>;
  createPosition(position: InsertTradingPosition): Promise<TradingPosition>;
  closePosition(positionId: number, closePrice: string): Promise<TradingPosition>;
  
  // Funded Accounts
  getUserFundedAccounts(userId: string): Promise<FundedAccount[]>;
  createFundedAccount(account: InsertFundedAccount): Promise<FundedAccount>;
  updateFundedAccount(accountId: number, data: Partial<InsertFundedAccount>): Promise<FundedAccount>;
  getFundedAccountPerformance(accountId: number): Promise<AccountPerformance[]>;
  recordAccountPerformance(performance: InsertAccountPerformance): Promise<AccountPerformance>;
  getTopFundedTraders(): Promise<Array<FundedAccount & { user: User }>>;
  
  // Dashboard data
  getUserDashboardData(userId: string): Promise<{
    user: User;
    activeTournament?: Tournament;
    participantData?: TournamentParticipant;
    leaderboard: TournamentParticipant[];
    userPositions: TradingPosition[];
    fundedAccounts: FundedAccount[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Trading Plans
  async getTradingPlans(): Promise<TradingPlan[]> {
    return await db.select().from(tradingPlans);
  }

  async getTradingPlan(id: number): Promise<TradingPlan | undefined> {
    const [plan] = await db.select().from(tradingPlans).where(eq(tradingPlans.id, id));
    return plan;
  }

  async createTradingPlan(plan: InsertTradingPlan): Promise<TradingPlan> {
    const [newPlan] = await db.insert(tradingPlans).values(plan).returning();
    return newPlan;
  }

  // Currency Pairs
  async getCurrencyPairs(): Promise<CurrencyPair[]> {
    return await db.select().from(currencyPairs);
  }

  async getCurrencyPair(id: number): Promise<CurrencyPair | undefined> {
    const [pair] = await db.select().from(currencyPairs).where(eq(currencyPairs.id, id));
    return pair;
  }

  async updateCurrencyPair(id: number, data: Partial<InsertCurrencyPair>): Promise<CurrencyPair> {
    const [pair] = await db
      .update(currencyPairs)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(currencyPairs.id, id))
      .returning();
    return pair;
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
  }

  async getActiveTournament(): Promise<Tournament | undefined> {
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.isActive, true))
      .limit(1);
    return tournament;
  }

  async getTournamentParticipants(tournamentId: number): Promise<TournamentParticipant[]> {
    return await db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .orderBy(desc(tournamentParticipants.totalPnl));
  }

  async joinTournament(data: InsertTournamentParticipant): Promise<TournamentParticipant> {
    const [participant] = await db.insert(tournamentParticipants).values(data).returning();
    return participant;
  }

  async updateParticipantBalance(participantId: number, balance: string, pnl: string): Promise<void> {
    await db
      .update(tournamentParticipants)
      .set({ currentBalance: balance, totalPnl: pnl })
      .where(eq(tournamentParticipants.id, participantId));
  }

  // Trading Positions
  async getUserPositions(userId: string): Promise<TradingPosition[]> {
    return await db
      .select()
      .from(tradingPositions)
      .where(eq(tradingPositions.userId, userId))
      .orderBy(desc(tradingPositions.openedAt));
  }

  async createPosition(position: InsertTradingPosition): Promise<TradingPosition> {
    const [newPosition] = await db.insert(tradingPositions).values(position).returning();
    return newPosition;
  }

  async closePosition(positionId: number, closePrice: string): Promise<TradingPosition> {
    const [position] = await db
      .update(tradingPositions)
      .set({
        closePrice,
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(tradingPositions.id, positionId))
      .returning();
    return position;
  }

  // Dashboard data
  async getUserDashboardData(userId: string): Promise<{
    user: User;
    activeTournament?: Tournament;
    participantData?: TournamentParticipant;
    leaderboard: TournamentParticipant[];
    userPositions: TradingPosition[];
  }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const activeTournament = await this.getActiveTournament();
    let participantData: TournamentParticipant | undefined;
    let leaderboard: TournamentParticipant[] = [];

    if (activeTournament) {
      leaderboard = await this.getTournamentParticipants(activeTournament.id);
      participantData = leaderboard.find(p => p.userId === userId);
    }

    const userPositions = await this.getUserPositions(userId);

    const fundedAccounts = await this.getUserFundedAccounts(userId);

    return {
      user,
      activeTournament,
      participantData,
      leaderboard,
      userPositions,
      fundedAccounts,
    };
  }

  // Funded Accounts implementation
  async getUserFundedAccounts(userId: string): Promise<FundedAccount[]> {
    return await db.select().from(fundedAccounts).where(eq(fundedAccounts.userId, userId));
  }

  async createFundedAccount(account: InsertFundedAccount): Promise<FundedAccount> {
    const [newAccount] = await db
      .insert(fundedAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateFundedAccount(accountId: number, data: Partial<InsertFundedAccount>): Promise<FundedAccount> {
    const [updatedAccount] = await db
      .update(fundedAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fundedAccounts.id, accountId))
      .returning();
    return updatedAccount;
  }

  async getFundedAccountPerformance(accountId: number): Promise<AccountPerformance[]> {
    return await db
      .select()
      .from(accountPerformance)
      .where(eq(accountPerformance.fundedAccountId, accountId))
      .orderBy(desc(accountPerformance.recordedAt));
  }

  async recordAccountPerformance(performance: InsertAccountPerformance): Promise<AccountPerformance> {
    const [newRecord] = await db
      .insert(accountPerformance)
      .values(performance)
      .returning();
    return newRecord;
  }

  async getTopFundedTraders(): Promise<Array<FundedAccount & { user: User }>> {
    const topTraders = await db
      .select({
        id: fundedAccounts.id,
        userId: fundedAccounts.userId,
        accountType: fundedAccounts.accountType,
        initialBalance: fundedAccounts.initialBalance,
        currentBalance: fundedAccounts.currentBalance,
        equity: fundedAccounts.equity,
        maxDrawdown: fundedAccounts.maxDrawdown,
        currentDrawdown: fundedAccounts.currentDrawdown,
        profitTarget: fundedAccounts.profitTarget,
        status: fundedAccounts.status,
        createdAt: fundedAccounts.createdAt,
        updatedAt: fundedAccounts.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          subscriptionPlanId: users.subscriptionPlanId,
        }
      })
      .from(fundedAccounts)
      .innerJoin(users, eq(fundedAccounts.userId, users.id))
      .where(eq(fundedAccounts.status, "active"))
      .orderBy(desc(sql`(${fundedAccounts.currentBalance} - ${fundedAccounts.initialBalance})`))
      .limit(10);
    
    return topTraders;
  }
}

export const storage = new DatabaseStorage();

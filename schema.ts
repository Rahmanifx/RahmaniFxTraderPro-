import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  subscriptionPlanId: integer("subscription_plan_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading Plans
export const tradingPlans = pgTable("trading_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxPositions: integer("max_positions").notNull(), // -1 for unlimited
  features: jsonb("features").notNull(), // array of feature strings
  isPopular: boolean("is_popular").default(false),
});

// Currency Pairs
export const currencyPairs = pgTable("currency_pairs", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol").notNull().unique(),
  name: varchar("name").notNull(),
  bid: decimal("bid", { precision: 10, scale: 5 }).notNull(),
  ask: decimal("ask", { precision: 10, scale: 5 }).notNull(),
  change: decimal("change", { precision: 10, scale: 5 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Tournaments
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tournament Participants
export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  userId: varchar("user_id").notNull(),
  initialBalance: decimal("initial_balance", { precision: 15, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(),
  totalPnl: decimal("total_pnl", { precision: 15, scale: 2 }).notNull(),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Trading Positions
export const tradingPositions = pgTable("trading_positions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  currencyPairId: integer("currency_pair_id").notNull(),
  type: varchar("type").notNull(), // 'buy' or 'sell'
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  openPrice: decimal("open_price", { precision: 10, scale: 5 }).notNull(),
  closePrice: decimal("close_price", { precision: 10, scale: 5 }),
  currentPnl: decimal("current_pnl", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status").default("open"), // 'open', 'closed'
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Funded Accounts for live tracking
export const fundedAccounts = pgTable("funded_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountType: varchar("account_type", { length: 50 }).notNull(), // e.g., "Challenge", "Funded", "Pro"
  initialBalance: decimal("initial_balance", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull(),
  equity: decimal("equity", { precision: 12, scale: 2 }).notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }).notNull(), // percentage
  currentDrawdown: decimal("current_drawdown", { precision: 5, scale: 2 }).default("0"),
  profitTarget: decimal("profit_target", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }).default("active"), // active, suspended, passed, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Account performance tracking
export const accountPerformance = pgTable("account_performance", {
  id: serial("id").primaryKey(),
  fundedAccountId: integer("funded_account_id").notNull().references(() => fundedAccounts.id),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull(),
  equity: decimal("equity", { precision: 12, scale: 2 }).notNull(),
  drawdown: decimal("drawdown", { precision: 5, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 12, scale: 2 }).notNull(),
  tradesCount: integer("trades_count").default(0),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  subscriptionPlan: one(tradingPlans, {
    fields: [users.subscriptionPlanId],
    references: [tradingPlans.id],
  }),
  tournamentParticipants: many(tournamentParticipants),
  tradingPositions: many(tradingPositions),
  fundedAccounts: many(fundedAccounts),
}));

export const tradingPlansRelations = relations(tradingPlans, ({ many }) => ({
  users: many(users),
}));

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  participants: many(tournamentParticipants),
}));

export const tournamentParticipantsRelations = relations(tournamentParticipants, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentParticipants.tournamentId],
    references: [tournaments.id],
  }),
  user: one(users, {
    fields: [tournamentParticipants.userId],
    references: [users.id],
  }),
}));

export const currencyPairsRelations = relations(currencyPairs, ({ many }) => ({
  tradingPositions: many(tradingPositions),
}));

export const tradingPositionsRelations = relations(tradingPositions, ({ one }) => ({
  user: one(users, {
    fields: [tradingPositions.userId],
    references: [users.id],
  }),
  currencyPair: one(currencyPairs, {
    fields: [tradingPositions.currencyPairId],
    references: [currencyPairs.id],
  }),
}));

export const fundedAccountsRelations = relations(fundedAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [fundedAccounts.userId],
    references: [users.id],
  }),
  performanceRecords: many(accountPerformance),
}));

export const accountPerformanceRelations = relations(accountPerformance, ({ one }) => ({
  fundedAccount: one(fundedAccounts, {
    fields: [accountPerformance.fundedAccountId],
    references: [fundedAccounts.id],
  }),
}));

// Insert schemas
export const insertTradingPlanSchema = createInsertSchema(tradingPlans);
export const insertCurrencyPairSchema = createInsertSchema(currencyPairs);
export const insertTournamentSchema = createInsertSchema(tournaments);
export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants);
export const insertTradingPositionSchema = createInsertSchema(tradingPositions);
export const insertFundedAccountSchema = createInsertSchema(fundedAccounts);
export const insertAccountPerformanceSchema = createInsertSchema(accountPerformance);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TradingPlan = typeof tradingPlans.$inferSelect;
export type InsertTradingPlan = z.infer<typeof insertTradingPlanSchema>;
export type CurrencyPair = typeof currencyPairs.$inferSelect;
export type InsertCurrencyPair = z.infer<typeof insertCurrencyPairSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;
export type TradingPosition = typeof tradingPositions.$inferSelect;
export type InsertTradingPosition = z.infer<typeof insertTradingPositionSchema>;
export type FundedAccount = typeof fundedAccounts.$inferSelect;
export type InsertFundedAccount = z.infer<typeof insertFundedAccountSchema>;
export type AccountPerformance = typeof accountPerformance.$inferSelect;
export type InsertAccountPerformance = z.infer<typeof insertAccountPerformanceSchema>;

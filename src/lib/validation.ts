import { z } from "zod";

// Deposit validation
export const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive").min(1, "Minimum deposit is ₹1"),
  utrNumber: z.string()
    .length(12, "UTR must be exactly 12 digits")
    .regex(/^\d{12}$/, "UTR must contain only digits"),
  screenshotUrl: z.string().url("Invalid screenshot URL"),
});

// Withdrawal validation
export const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive").min(100, "Minimum withdrawal is ₹100"),
  upiId: z.string()
    .min(3, "UPI ID is required")
    .max(255, "UPI ID is too long")
    .regex(/^[\w.\-@]+$/, "Invalid UPI ID format"),
});

// Tournament creation validation
export const tournamentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name is too long"),
  entryFee: z.number().min(0, "Entry fee cannot be negative"),
  totalSlots: z.number().int().positive("Must have at least 1 slot").max(100, "Maximum 100 slots"),
  startDate: z.string().datetime("Invalid date format"),
  gameMode: z.enum(["Solo", "Duo", "Squad"], { 
    errorMap: () => ({ message: "Invalid game mode" }) 
  }),
  tournamentType: z.enum(["BR", "CS", "LoneWolf"], {
    errorMap: () => ({ message: "Invalid tournament type" })
  }),
  prizeDistribution: z.record(z.string(), z.number().nonnegative()),
  roomId: z.string().max(50).optional().nullable(),
  roomPassword: z.string().max(50).optional().nullable(),
  tournamentRules: z.string().max(5000).optional().nullable(),
});

// Admin creation validation
export const adminSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// User registration validation
export const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phoneNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
    .optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Boss approval validation
export const depositApprovalSchema = z.object({
  depositId: z.string().uuid("Invalid deposit ID"),
  bossNotes: z.string().max(500, "Notes are too long").optional(),
});

export const withdrawalApprovalSchema = z.object({
  withdrawalId: z.string().uuid("Invalid withdrawal ID"),
  payoutUtr: z.string()
    .length(12, "UTR must be exactly 12 digits")
    .regex(/^\d{12}$/, "UTR must contain only digits"),
});

export const withdrawalCancellationSchema = z.object({
  withdrawalId: z.string().uuid("Invalid withdrawal ID"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason is too long"),
});

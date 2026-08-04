// lib/fees.ts

export function calculatePlatformFee(
  entryFee: number,
  maxPlayers: number,
  platformFeePercentage: number = 10
): {
  totalPot: number;
  platformFee: number;
  prizePool: number;
} {
  const totalPot = entryFee * maxPlayers;
  const platformFee = (totalPot * platformFeePercentage) / 100;
  const prizePool = totalPot - platformFee;

  return {
    totalPot,
    platformFee,
    prizePool,
  };
}

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
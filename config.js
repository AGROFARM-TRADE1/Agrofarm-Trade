require("dotenv").config();
module.exports = {
  port: Number(process.env.PORT || 4000),
  webUrl: process.env.WEB_URL || "http://localhost:3000",
  minWithdrawal: Number(process.env.MIN_WITHDRAWAL || 10000),
  withdrawalFeeRate: Number(process.env.WITHDRAWAL_FEE_RATE || 0.005),
  referralReward: Number(process.env.REFERRAL_REWARD || 150),
  depositBankName: process.env.DEPOSIT_BANK_NAME || "Moniepoint",
  depositAccountNumber: process.env.DEPOSIT_ACCOUNT_NUMBER || "6841233423"
};

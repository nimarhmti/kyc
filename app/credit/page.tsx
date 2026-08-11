import { BankCard, CardData } from "../bank/bankCard";

// Sample data — swap this out with real card data from your API/state in the actual app.
export const SAMPLE_CARD: CardData = {
  brandName: "AFRAWALLET",
  cardNumber: "1234567891051478",
  holderName: "NAFISEH IMANZADEH",
  cvc: "984",
  expiry: "10/28",
  bankName: "Bank Passargad",
};

export default function BankCardDemo() {
  return <BankCard data={SAMPLE_CARD} />;
}

export type TransactionTypeEnumString = "PAYMENT" | "EXPENSE"

export const mapTransactionTypeToBackend = (
  type: string | TransactionTypeEnumString
): number => {
  switch (type) {
    case "PAYMENT":
      return 0
    case "EXPENSE":
      return 1
    default:
      return 1
  }
}

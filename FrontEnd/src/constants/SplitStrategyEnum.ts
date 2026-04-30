export type SplitStrategyEnum = "EQUALLY" | "EXACTLY" | "PERCENTAGE"

export const mapSplitStrategyToBackend = (
  strategy: string | SplitStrategyEnum
): number => {
  switch (strategy) {
    case "EQUALLY":
      return 0
    case "EXACTLY":
      return 1
    case "PERCENTAGE":
      return 2
    case "OTHER":
      return 3
    default:
      return 0
  }
}

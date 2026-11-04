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

export const mapSplitStrategyToBackend_num_to_string = (
  strategy: number | SplitStrategyEnum
): string => {
  switch (strategy) {
    case 0:
      return "EQUALLY"
    case 1:
      return "EXACTLY"
    case 2:
      return "PERCENTAGE"
    case 3:
      return "OTHER"
    default:
      return "EQUALLY"
  }
}

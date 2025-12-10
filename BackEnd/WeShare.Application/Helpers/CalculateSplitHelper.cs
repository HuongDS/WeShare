using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WeShare.Core.Constants;
using WeShare.Core.Enums;

namespace WeShare.Application.Helpers
{
    public class CalculateSplitHelper
    {
        public static Dictionary<int, decimal> CalculateSplitAmount(decimal totalAmount, List<int> debtors, SplitStrategyEnum typeSplit, Dictionary<int, decimal>? splitElements)
        {
            if (totalAmount <= 0)
            {
                throw new Exception(ErrorMessage.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO);
            }
            if (debtors.Count <= 0)
            {
                throw new Exception(ErrorMessage.DEBTOR_EMPTY);
            }
            if (splitElements != null && splitElements.Any(item => item.Value < 0))
            {
                throw new Exception(ErrorMessage.OWED_AMOUNT_CANNOT_BE_NEGATIVE);
            }
            var result = new Dictionary<int, decimal>();

            switch (typeSplit)
            {
                case SplitStrategyEnum.EQUALLY:
                    {
                        var splitAmount = Math.Round(totalAmount / debtors.Count, 2);
                        var remain = totalAmount - (splitAmount * debtors.Count);
                        var steps = (int)(100 * remain);
                        foreach (var item in debtors)
                        {
                            result[item] = splitAmount;
                        }
                        for (int i = 0; i < steps; i++)
                        {
                            result[debtors[i]] += 0.01M; // decimal 
                        }
                        return result;
                    }
                case SplitStrategyEnum.EXACTLY:
                    {
                        var totalFromSplits = splitElements.Sum(x => (decimal)x.Value);
                        if (totalFromSplits != totalAmount)
                        {
                            throw new Exception(ErrorMessage.TOTAL_FROM_SPLITS_MUST_BE_EQUAL_TO_TOTAL_AMOUNT);
                        }
                        return splitElements;
                    }
                case SplitStrategyEnum.PERCENTAGE:
                    {
                        var totalPercentage = splitElements.Values.Sum();
                        if (totalPercentage != 100)
                        {
                            throw new Exception(ErrorMessage.TOTAL_FROM_SPLITS_PERCENTAGE_MUST_BE_EQUAL_TO_TOTAL_AMOUNT);
                        }
                        foreach (var item in debtors)
                        {
                            var percentage = splitElements[item];
                            var splitAmount = Math.Round((percentage / 100) * totalAmount, 2);
                            result[item] = splitAmount;
                        }
                        var totalFromSplits = result.Sum(x => (decimal)x.Value);
                        var remain = totalAmount - totalFromSplits;
                        var steps = (int)(100 * remain);
                        for (int i = 0; i < steps; i++)
                        {
                            result[debtors[i]] += 0.01M;
                        }
                        return result;
                    }
                default:
                    {
                        throw new Exception(ErrorMessage.SOME_THING_WENT_WRONG);
                    }
            }
        }
        public static bool IsValidSplitAmounts(decimal totalAmount, List<decimal> splitElements, SplitStrategyEnum typeSplit)
        {
            if (totalAmount <= 0)
            {
                throw new Exception(ErrorMessage.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO);
            }
            if (splitElements.Count <= 0)
            {
                throw new Exception(ErrorMessage.DEBTOR_EMPTY);
            }
            if (splitElements.Any(item => item < 0))
            {
                throw new Exception(ErrorMessage.OWED_AMOUNT_CANNOT_BE_NEGATIVE);
            }
            switch (typeSplit)
            {
                case SplitStrategyEnum.EXACTLY:
                    {
                        var totalFromSplits = splitElements.Sum(x => (decimal)x);
                        return totalFromSplits == totalAmount;
                    }
                case SplitStrategyEnum.PERCENTAGE:
                    {
                        var totalPercentage = splitElements.Sum();
                        return totalPercentage == 100;
                    }
                default:
                    {
                        throw new Exception(ErrorMessage.SOME_THING_WENT_WRONG);
                    }
            }
        }
    }
}

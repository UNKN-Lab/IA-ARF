import { MixIcon, SquareIcon } from "@radix-ui/react-icons"

export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  comparisonOperators: [
    { label: "equals", value: "equals" as const },
    { label: "in", value: "in" as const },
    { label: "notIn", value: "notIn" as const },
    { label: "lt", value: "lt" as const },
    { label: "lte", value: "lte" as const },
    { label: "gt", value: "gt" as const },
    { label: "gte", value: "gte" as const },
    { label: "contains", value: "contains" as const },
    { label: "startsWith", value: "startsWith" as const },
    { label: "endsWith", value: "endsWith" as const },
    { label: "not", value: "not" as const },
  ],
  selectableOperators: [
    { label: "equals", value: "equals" as const },
    { label: "in", value: "in" as const },
    { label: "notIn", value: "notIn" as const },
    { label: "not", value: "not" as const },
  ],
  logicalOperators: [
    {
      label: "And",
      value: "and" as const,
      description: "All conditions must be met",
    },
    {
      label: "Or",
      value: "or" as const,
      description: "At least one condition must be met",
    },
  ],
  featureFlags: [
    {
      label: "Advanced filter",
      value: "advancedFilter" as const,
      icon: MixIcon,
      tooltipTitle: "Toggle advanced filter",
      tooltipDescription: "A notion like query builder to filter rows.",
    },
  ],
}

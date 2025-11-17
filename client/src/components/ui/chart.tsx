"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)
function useChart() { const context = React.useContext(ChartContext); if (!context) throw new Error("useChart must be used within a <ChartContainer />"); return context }

const ChartContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { config: ChartConfig, children: React.ReactNode }>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
    return (
      <ChartContext.Provider value={{ config }}>
        <div data-chart={chartId} ref={ref} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
          <ChartStyle id={chartId} config={config} />
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string, config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, cfg]) => cfg.theme || cfg.color)
  if (!colorConfig.length) return null
  return (
    <style dangerouslySetInnerHTML={{
      __html: Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
  const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
  return color ? `  --color-${key}: ${color};` : ""
}).join("\n")}
}
`).join("\n")
    }} />
  )
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { payload?: any[], indicator?: "dot" | "line" | "dashed", hideLabel?: boolean, hideIndicator?: boolean, labelKey?: string }>(
  ({ payload = [], indicator = "dot", hideLabel = false, hideIndicator = false, labelKey, className }, ref) => {
    const { config } = useChart()
    if (!payload.length) return null
    return (
      <div ref={ref} className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
        {payload.map((item: any, index: number) => {
          const key = `${labelKey || item.name || item.dataKey || "value"}`
          const itemConfig = config[key] || {}
          const indicatorColor = item.payload?.fill || item.color
          return (
            <div key={index} className="flex w-full items-center gap-2">
              {!hideIndicator && <div className="h-2 w-2 rounded" style={{ backgroundColor: indicatorColor }} />}
              <span>{itemConfig.label || item.name}</span>
              {item.value != null && <span>{item.value}</span>}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltipContent, ChartStyle }

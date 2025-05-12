'use client'

import { History } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatDate } from "@/lib/utils"

const chartConfig = {
  desktop: {
    label: "Scripts",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Ideas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type ChartDataType = {
  name: string,
  value: number,
}

export function Chart({ title, chartData, userData }: { title: string, chartData: ChartDataType[], userData?: { created_at: string } }) {
  const totalVisitors = chartData.reduce((acc, curr) => acc + curr.value, 0)
  
  // Transform data to match the expected format
  const transformedData = [{
    desktop: chartData[0]?.value || 0,
    mobile: chartData[1]?.value || 0,
  }]

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>Content Creation Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={transformedData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalVisitors}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="desktop"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-desktop)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="mobile"
              fill="var(--color-mobile)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col text-sm">
        {userData && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs flex items-center gap-1">
              <History className="w-4 h-4" /> From {formatDate(userData.created_at, 'normal')}
            </p>
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          Showing total content creation stats
        </div>
      </CardFooter>
    </Card>
  )
}

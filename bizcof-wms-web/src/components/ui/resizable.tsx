import { createContext, useContext, useState } from "react"
import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

// Context for panel sizes
const PanelSizesContext = createContext<{
  sizes: number[]
  direction: "horizontal" | "vertical"
}>({ sizes: [], direction: "horizontal" })

const ResizablePanelGroup = ({
  className,
  onLayout,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => {
  const [sizes, setSizes] = useState<number[]>([])

  const handleLayout = (newSizes: number[]) => {
    setSizes(newSizes)
    onLayout?.(newSizes)
  }

  return (
    <PanelSizesContext.Provider value={{ sizes, direction: props.direction || "horizontal" }}>
      <ResizablePrimitive.PanelGroup
        className={cn(
          "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
          className
        )}
        onLayout={handleLayout}
        {...props}
      />
    </PanelSizesContext.Provider>
  )
}

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => {
  const { sizes, direction } = useContext(PanelSizesContext)
  const [isHovered, setIsHovered] = useState(false)

  const formatSizes = () => {
    if (!sizes || sizes.length < 2) return null
    const separator = direction === "horizontal" ? " | " : " / "
    return sizes.map(s => `${Math.round(s)}%`).join(separator)
  }

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border relative">
          <GripVertical className="h-2.5 w-2.5" />
          {isHovered && sizes.length >= 2 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border whitespace-nowrap z-50">
              {formatSizes()}
            </div>
          )}
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

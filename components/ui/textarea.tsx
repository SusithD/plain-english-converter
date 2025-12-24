import * as React from "react"

import { cn } from "@/lib/utils"

function autoGrow(el: HTMLTextAreaElement) {
  // Smoothly adjust height to fit content without jumping
  el.style.height = "auto"
  el.style.height = `${el.scrollHeight}px`
}

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, onInput, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useEffect(() => {
      if (innerRef.current) {
        autoGrow(innerRef.current)
      }
    }, [])

    const setRefs = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref && typeof (ref as any) === "object") (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    }

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      autoGrow(e.currentTarget)
      onInput?.(e)
    }

    return (
      <textarea
        ref={setRefs}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onInput={handleInput}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }

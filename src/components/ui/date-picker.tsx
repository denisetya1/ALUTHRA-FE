"use client"

import { format } from "date-fns"
import { CalendarDays, ChevronDown } from "lucide-react"
import { useState } from "react"
import type { Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  selected?: Date
  onSelect: (date: Date) => void
  placeholder?: string
  displayFormat?: string
  disabled?: Matcher | Matcher[]
  className?: string
}

function DatePicker({
  selected,
  onSelect,
  placeholder = "Select date",
  displayFormat = "dd-MM-yyyy",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-empty={!selected}
          className={cn("w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground", className)}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <CalendarDays className="size-4" />
            {selected ? format(selected, displayFormat) : placeholder}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disabled}
          onSelect={(date) => {
            if (!date) return
            onSelect(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, type DatePickerProps }

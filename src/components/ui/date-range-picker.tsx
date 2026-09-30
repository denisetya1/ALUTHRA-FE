"use client"

import { format } from "date-fns"
import { CalendarDays, ChevronDown } from "lucide-react"
import { useState } from "react"
import type { DateRange, Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateRangePickerProps = {
  selectedDate?: DateRange
  onSelect: (date: DateRange | undefined) => void
  numberOfMonths?: number
  placeholder?: string
  displayFormat?: string
  disabled?: Matcher | Matcher[]
  className?: string
}

function DateRangePicker({
  selectedDate,
  onSelect,
  numberOfMonths = 1,
  placeholder = "Select date range",
  displayFormat = "dd MMM yyyy",
  disabled,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const date = selectedDate

  const label = date?.from
    ? date.to
      ? `${format(date.from, displayFormat)} – ${format(date.to, displayFormat)}`
      : format(date.from, displayFormat)
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-empty={!date?.from}
          className={cn("w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground", className)}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <CalendarDays className="size-4" />
            {label}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] overflow-auto p-0" align="start">
        <Calendar
          autoFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          disabled={disabled}
          numberOfMonths={numberOfMonths}
          onSelect={(range, selectedDay) => {
            if (date?.from && date?.to) {
              const next = { from: selectedDay, to: undefined }
              onSelect(next)
              return
            }
            onSelect(range)
            if (range?.from && range.to) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker, type DateRangePickerProps }

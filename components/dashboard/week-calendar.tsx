"use client"

import { useState } from "react"
import { format, addDays, subDays, startOfWeek, isSameDay } from "date-fns"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface WeekCalendarProps {
    selectedDate: Date
    onDateSelect: (date: Date) => void
}

export function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
    const [currentDate, setCurrentDate] = useState(selectedDate);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    const handlePrevWeek = () => {
        setCurrentDate(subDays(currentDate, 7));
    };

    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-medium">{format(currentDate, "MMMM yyyy")}</h3>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2">
                {weekDays.map((day) => (
                    <div
                        key={day.toString()}
                        className={cn(
                            "flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 transition-colors cursor-pointer",
                            isSameDay(day, selectedDate)
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-accent"
                        )}
                        onClick={() => onDateSelect(day)}
                    >
                        <span className="text-xs font-medium">{format(day, "d")}</span>
                        <span className="text-[10px] font-medium uppercase">{format(day, "EEE")}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

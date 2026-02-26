"use client"

import { Upload, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScreenUpload({ onLoadSample }: { onLoadSample: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Upload zone */}
        <div className="group flex w-full cursor-pointer flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border bg-card px-8 py-16 text-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-lg hover:shadow-primary/5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-200 group-hover:scale-105">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Upload Student Worksheet
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              .xlsx or .pdf — Use the standard Walton College advising worksheet
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Drag and drop or click to browse
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Demo button */}
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadSample}
            className="gap-2 px-6 text-sm font-medium shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Demo: Load Sample Student
          </Button>
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Loads a pre-filled worksheet for Jordan Martinez (BSBA Economics)
          </p>
        </div>
      </div>
    </div>
  )
}

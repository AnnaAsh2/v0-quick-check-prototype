"use client"

import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScreenUpload({ onLoadSample }: { onLoadSample: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        {/* Upload zone */}
        <div className="flex w-full flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-card px-8 py-14 text-center transition-colors hover:border-primary/40 hover:bg-secondary/50">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Upload Student Worksheet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              .xlsx or .pdf — Use the standard Walton College advising worksheet
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Drag and drop or click to browse
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Demo button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onLoadSample}
          className="gap-2 text-sm"
        >
          <FileText className="h-4 w-4" />
          Demo: Load Sample Student
        </Button>
        <p className="text-xs text-muted-foreground">
          Loads a pre-filled worksheet for Jordan Martinez (BSBA Economics)
        </p>
      </div>
    </div>
  )
}

"use client"

import { AlertCircle, CheckCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface VoiceTroubleshootProps {
  onTestMicrophone: () => void
  onClose: () => void
}

export default function VoiceTroubleshoot({ onTestMicrophone, onClose }: VoiceTroubleshootProps) {
  return (
    <Alert className="bg-amber-50 border-amber-200 mb-4 animate-slide-up">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-1" />
          <div className="ml-2">
            <AlertTitle className="text-amber-800 font-semibold">Voice Input Not Working?</AlertTitle>
            <AlertDescription className="text-amber-700">
              <div className="space-y-4 mt-2">
                <p>Try these troubleshooting steps:</p>

                <ol className="space-y-3 pl-0">
                  <li className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Check microphone permissions</strong>
                      <p className="text-sm mt-0.5">
                        Check your browser settings to ensure microphone access is enabled for this site.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Use a supported browser</strong>
                      <p className="text-sm mt-0.5">
                        Speech recognition works best in Chrome, Edge, or Safari. Firefox has limited support.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="font-medium">Check your microphone</strong>
                      <p className="text-sm mt-0.5">Make sure your microphone is properly connected and not muted.</p>
                    </div>
                  </li>
                </ol>

                <div className="flex gap-2 mt-4">
                  <Button onClick={onTestMicrophone} className="bg-amber-600 hover:bg-amber-700">
                    Test Microphone
                  </Button>
                  <Button variant="outline" onClick={onClose} className="border-amber-300">
                    Switch to Text Mode
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 rounded-full">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
    </Alert>
  )
}

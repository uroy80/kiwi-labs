"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Book, FileText, Upload, GraduationCap, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { KiwiLogo } from "@/components/kiwi-logo"

export default function CreateSubjectiveVivaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    subjectLevel: "undergraduate",
    additionalNotes: "",
    hasProjectDocument: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (file) {
      // Check file type
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.ms-powerpoint",
      ]

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or PPT file.",
          variant: "destructive",
        })
        return
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setFormData((prev) => ({ ...prev, hasProjectDocument: true }))

      toast({
        title: "File uploaded",
        description: `${file.name} has been selected.`,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.subject || !formData.topic) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Create interview data
    const interviewData = {
      ...formData,
      interviewType: "subjective",
      fileDetails: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          }
        : null,
    }

    // Encode the interview data to pass via URL
    const encodedData = encodeURIComponent(JSON.stringify(interviewData))

    // Navigate to the user profile page with the data
    router.push(`/user-profile?data=${encodedData}&type=subjective`)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <KiwiLogo size="lg" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Create Subjective Viva</h1>
        <p className="text-muted-foreground">
          Provide details about your subject and topic for a tailored viva examination
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Subject Details
            </CardTitle>
            <CardDescription>Enter information about the subject and topic for your viva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Book className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="e.g. Computer Science"
                    className="pl-10"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectLevel">Education Level</Label>
                <Select
                  value={formData.subjectLevel}
                  onValueChange={(value) => handleSelectChange("subjectLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">
                Topic <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="topic"
                  name="topic"
                  placeholder="e.g. Data Structures and Algorithms"
                  className="pl-10"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                placeholder="Any specific areas you want the viva to focus on..."
                className="min-h-[80px]"
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Project Document (Optional)</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.docx,.ppt,.pptx,.doc"
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Upload your project document</p>
                <p className="text-xs text-muted-foreground mb-2">PDF, DOCX, or PPT (Max 10MB)</p>

                {selectedFile && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <File className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">{selectedFile.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Viva..." : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="mt-8 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-start gap-3">
          <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Pro Tip</h3>
            <p className="text-sm text-muted-foreground">
              For the best results, be specific about your topic and upload a project document if available. This helps
              our AI generate more relevant and challenging viva questions tailored to your work.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

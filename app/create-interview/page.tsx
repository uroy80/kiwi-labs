"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Briefcase, FileText, GraduationCap, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { KiwiLogo } from "@/components/kiwi-logo"

export default function CreateInterviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    jobDescription: "",
    requiredSkills: "",
    experienceLevel: "mid-level",
    interviewType: "technical",
    additionalNotes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.jobTitle || !formData.jobDescription || !formData.requiredSkills) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Encode the interview data to pass via URL
    const encodedData = encodeURIComponent(JSON.stringify(formData))

    // Navigate to the user profile page with the data
    router.push(`/user-profile?data=${encodedData}&type=interview`)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl animate-fade-in">
      <Button variant="ghost" className="mb-6 group" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Button>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <KiwiLogo size="lg" />
        </div>
        <h1 className="text-3xl font-bold mb-2 gradient-heading">Create Custom Interview</h1>
        <p className="text-muted-foreground">
          Provide details about the job to generate a tailored interview experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
        <Card className="fancy-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Job Details
            </CardTitle>
            <CardDescription>Enter information about the position you're interviewing for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="flex items-center gap-1">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="e.g. Frontend Developer"
                    className="pl-10 transition-all border-primary/20 focus:border-primary"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="e.g. Acme Corporation"
                  className="transition-all border-primary/20 focus:border-primary"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="flex items-center gap-1">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Paste the job description here..."
                  className="pl-10 min-h-[120px] transition-all border-primary/20 focus:border-primary"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSkills" className="flex items-center gap-1">
                Required Skills <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="requiredSkills"
                name="requiredSkills"
                placeholder="e.g. React, TypeScript, Node.js, etc."
                className="min-h-[80px] transition-all border-primary/20 focus:border-primary"
                value={formData.requiredSkills}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                >
                  <SelectTrigger className="transition-all border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry-level">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid-level">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (6+ years)</SelectItem>
                    <SelectItem value="lead">Lead/Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Focus</Label>
                <Select
                  value={formData.interviewType}
                  onValueChange={(value) => handleSelectChange("interviewType", value)}
                >
                  <SelectTrigger className="transition-all border-primary/20 focus:border-primary">
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Skills</SelectItem>
                    <SelectItem value="behavioral">Behavioral/Soft Skills</SelectItem>
                    <SelectItem value="mixed">Mixed (Technical & Behavioral)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                placeholder="Any specific areas you want the interview to focus on..."
                className="min-h-[80px] transition-all border-primary/20 focus:border-primary"
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full fancy-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating Interview..." : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="mt-8 p-6 rounded-xl bg-accent fancy-border animate-slide-up">
        <div className="flex items-start gap-3">
          <GraduationCap className="h-6 w-6 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Pro Tips</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Provide a detailed job description for more relevant questions</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>List specific technical skills to focus on those areas</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Choose the right experience level to get appropriately challenging questions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, User, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { KiwiLogo } from "@/components/kiwi-logo"

export default function UserProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    gender: "male", // Default to male
  })

  // Get the interview data from URL
  const interviewData = searchParams.get("data")
  const interviewType = searchParams.get("type") || "interview" // Default to interview if not specified

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value: string) => {
    setProfile((prev) => ({ ...prev, gender: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!profile.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Combine profile data with interview data
    if (interviewData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(interviewData))
        const combinedData = {
          ...decodedData,
          userProfile: profile,
        }

        // Encode the combined data
        const encodedCombinedData = encodeURIComponent(JSON.stringify(combinedData))

        // Navigate to the interview page with the combined data
        router.push(`/interview?data=${encodedCombinedData}`)
      } catch (error) {
        console.error("Error processing interview data:", error)
        toast({
          title: "Error",
          description: "There was a problem processing your data. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } else {
      toast({
        title: "Missing Data",
        description: "Interview data is missing. Please start over.",
        variant: "destructive",
      })
      router.push("/")
      setIsSubmitting(false)
    }
  }

  const getBackPath = () => {
    if (interviewType === "subjective") {
      return "/create-subjective-viva"
    }
    return "/create-interview"
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Button variant="ghost" className="mb-6" onClick={() => router.push(getBackPath())}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <KiwiLogo size="lg" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Please provide your information for a personalized experience</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Details
            </CardTitle>
            <CardDescription>This information will be used to personalize your interview experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Gender</Label>
              <RadioGroup value={profile.gender} onValueChange={handleGenderChange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="font-normal cursor-pointer flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/male-avatar.png" alt="Male avatar" />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    Male
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="font-normal cursor-pointer flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/female-avatar.png" alt="Female avatar" />
                      <AvatarFallback>F</AvatarFallback>
                    </Avatar>
                    Female
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal cursor-pointer flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/neutral-avatar.png" alt="Neutral avatar" />
                      <AvatarFallback>O</AvatarFallback>
                    </Avatar>
                    Other / Prefer not to say
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-4 flex justify-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`/${profile.gender}-avatar.png`} alt="Selected avatar" />
                <AvatarFallback>
                  <UserCircle className="h-20 w-20" />
                </AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Continue to Interview"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

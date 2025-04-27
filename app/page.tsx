import Link from "next/link"
import { ArrowRight, Briefcase, GraduationCap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { KiwiLogo } from "@/components/kiwi-logo"
import { Header } from "@/components/header"
import { AtomOrbital } from "@/components/atom-orbital"
import { FloatingShapes } from "@/components/floating-shapes"

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-20 right-10 opacity-70 hidden lg:block">
          <AtomOrbital size={400} color="#c87533" />
        </div>
        <div className="absolute bottom-40 left-10 opacity-50 hidden lg:block">
          <AtomOrbital size={300} color="#d4a76a" speed={8} />
        </div>
        <FloatingShapes />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in relative">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse"></div>
                <KiwiLogo size="xl" className="relative" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 gradient-heading leading-tight font-serif">
              AI-Powered Interview Practice
            </h1>
            <p className="text-xl font-light text-foreground mb-8 bg-gradient-to-r from-primary/20 to-secondary/20 py-2 px-4 rounded-lg inline-block shadow-sm tracking-wide font-sans">
              Practice with AI interviews tailored to specific job roles and academic requirements
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/create-interview">
                <Button size="lg" className="fancy-button group font-sans font-medium tracking-wide">
                  <Briefcase className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                  Create Job Interview
                </Button>
              </Link>
              <Link href="/create-subjective-viva">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 hover:bg-primary/5 transition-colors backdrop-blur-sm font-sans font-medium tracking-wide"
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Create Academic Viva
                </Button>
              </Link>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-slide-up">
              <div className="gradient-border">
                <Card className="card-hover border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/30 to-primary/20">
                    <CardTitle className="flex items-center gap-2 text-foreground text-2xl font-serif">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Job Interview
                    </CardTitle>
                    <CardDescription className="text-foreground font-light tracking-wide text-base font-sans">
                      Prepare for your next job interview with tailored questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="overflow-hidden rounded-lg mb-4 border-2 border-primary/30 flex justify-center items-center h-48 bg-gradient-to-br from-primary/5 to-transparent">
                      <img
                        src="/job-interview.webp"
                        alt="Job interview illustration"
                        className="h-auto max-h-48 w-auto max-w-[110%] scale-110 object-contain transition-transform hover:scale-115 duration-700"
                      />
                    </div>
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-3 rounded-md border border-primary/30 shadow-sm">
                      <p className="text-sm font-light text-foreground leading-relaxed font-sans">
                        Our AI will generate relevant questions based on the job description and requirements you
                        provide.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gradient-to-r from-primary/20 to-transparent">
                    <Link href="/create-interview" className="w-full">
                      <Button className="w-full fancy-button font-sans font-medium tracking-wide">
                        Create Job Interview
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              <div className="gradient-border">
                <Card className="card-hover border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/30 to-primary/20">
                    <CardTitle className="flex items-center gap-2 text-foreground text-2xl font-serif">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Subjective Viva
                    </CardTitle>
                    <CardDescription className="text-foreground font-light tracking-wide text-base font-sans">
                      Practice for academic viva examinations on your subject
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="overflow-hidden rounded-lg mb-4 border-2 border-primary/30 flex justify-center items-center h-48 bg-gradient-to-br from-primary/5 to-transparent">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ACD%20%282%29-KfpTptC46jJDzNVscsraHcnT0Z8Dol.png"
                        alt="Academic viva illustration"
                        className="h-auto max-h-48 w-auto max-w-full object-contain transition-transform hover:scale-105 duration-700"
                      />
                    </div>
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-3 rounded-md border border-primary/30 shadow-sm">
                      <p className="text-sm font-light text-foreground leading-relaxed font-sans">
                        Perfect for students preparing for oral examinations. Upload your project documents for more
                        targeted questions.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gradient-to-r from-primary/20 to-transparent">
                    <Link href="/create-subjective-viva" className="w-full">
                      <Button className="w-full fancy-button font-sans font-medium tracking-wide">
                        Create Subjective Viva
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div className="mt-24 animate-slide-up">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-2 bg-primary/20 rounded-full mb-4">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-light text-primary tracking-wider uppercase font-sans">
                    How It Works
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif gradient-heading tracking-tight mb-2">
                  Simple 3-Step Process
                </h2>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto font-light font-sans">
                  Get started with our intuitive interview preparation process
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-primary/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center mb-4 shadow-md">
                    <span className="text-xl font-serif">1</span>
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-foreground tracking-tight">Specify Details</h3>
                  <p className="text-foreground font-light leading-relaxed font-sans">
                    Enter job requirements or subject details, and optionally upload documents.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-primary/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center mb-4 shadow-md">
                    <span className="text-xl font-serif">2</span>
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-foreground tracking-tight">AI-Powered Interview</h3>
                  <p className="text-foreground font-light leading-relaxed font-sans">
                    Our AI generates relevant questions and evaluates your responses in real-time.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-primary/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center mb-4 shadow-md">
                    <span className="text-xl font-serif">3</span>
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-foreground tracking-tight">Get Feedback</h3>
                  <p className="text-foreground font-light leading-relaxed font-sans">
                    Receive detailed feedback and suggestions to improve your performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

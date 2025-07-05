/**
 * DASHBOARD 1: PUBLIC ACCESS LAYER (The Lobby)
 *
 * Who sees it? Anyone who opens the app (unauthenticated)
 * Purpose: Welcome, inform, reassure, and filter for serious users only
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Bot,
  Shield,
  FileText,
  Download,
  CheckCircle,
  UserPlus,
  LogIn,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

type PersonalityType = "strategist" | "guide" | "razor" | "ally";

interface PersonalityProfile {
  id: PersonalityType;
  name: string;
  description: string;
  icon: any;
  example: string;
}

const PERSONALITIES: PersonalityProfile[] = [
  {
    id: "strategist",
    name: "The Strategist",
    description: "Professional & Supportive - Gentle, encouraging approach",
    icon: CheckCircle,
    example: "I'm here to help guide you through this process step by step.",
  },
  {
    id: "guide",
    name: "The Guide",
    description: "Direct & Confident - Professional but assertive analysis",
    icon: Scale,
    example: "Let's analyze what happened and build a strong case.",
  },
  {
    id: "razor",
    name: "The Razor",
    description:
      "No BS & Aggressive - Dark humor, tell it like it is with attitude",
    icon: Shield,
    example:
      "Well, well, well... looks like someone's about to have a bad day.",
  },
  {
    id: "ally",
    name: "The Ally",
    description: "Balanced Approach - Supportive but realistic",
    icon: Bot,
    example: "We're in this together. Let's get you the justice you deserve.",
  },
];

export default function PublicDashboard() {
  const [selectedPersonality, setSelectedPersonality] =
    useState<PersonalityType>("strategist");
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleStartInterview = () => {
    if (!agreedToTerms) {
      alert("Please read and agree to the terms before proceeding.");
      return;
    }

    // Navigate to Dashboard 2 with selected personality
    navigate("/handler-dashboard", {
      state: {
        personality: selectedPersonality,
        fromPublic: true,
      },
    });
  };

  const handleSignIn = () => {
    // For now, just close dialog and proceed
    setIsSignInOpen(false);
    handleStartInterview();
  };

  const handleSignUp = () => {
    // For now, just close dialog and proceed
    setIsSignUpOpen(false);
    handleStartInterview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-10 w-10 text-blue-700" />
            <h1 className="text-4xl font-bold text-blue-900">
              AI Counsel for Pro Se Warriors
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-4">
            You are the attorney. We are the assistants.
          </p>

          {/* Power Statement */}
          <div className="bg-blue-50 border-l-4 border-blue-700 p-4 mb-6 text-left">
            <p className="text-lg font-semibold text-blue-900 mb-2">
              "It's not about who has the most money — it's who has the best
              paperwork."
            </p>
            <p className="text-blue-800">
              You're building a constitutional weapon system for people who've
              been shut out of justice because they didn't speak the
              bureaucratic dialect of Legalese. Now they will — in their own
              words, on their own terms, backed by AI-powered structure that
              obeys the law better than half the bar does.
            </p>
          </div>
        </div>

        {/* Three Violations Analysis Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6 border-2 border-blue-200 bg-white">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-blue-900">
              Violation Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Identify excessive force, unlawful search, false arrest, and other
              civil rights violations
            </p>
          </Card>
          <Card className="text-center p-6 border-2 border-green-200 bg-white">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-green-900">
              Build Your Case
            </h3>
            <p className="text-sm text-gray-600">
              Organize facts, evidence, and legal elements into courtroom-ready
              documentation
            </p>
          </Card>
          <Card className="text-center p-6 border-2 border-purple-200 bg-white">
            <Download className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-purple-900">
              Constitutional Weapon
            </h3>
            <p className="text-sm text-gray-600">
              Trial-grade, jury-grade, fed-grade documentation that judges
              respect
            </p>
          </Card>
        </div>

        {/* Main Interface Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Bot className="h-6 w-6 text-blue-700" />
              Constitutional AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Introduction from Blueprint */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Purpose of the System:
              </h3>
              <p className="text-gray-700 mb-4">
                To assist pro se litigants and legal self-advocates in
                documenting, analyzing, and assembling court-ready filings
                through an AI agent framework designed for precision, integrity,
                and legal safety.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900">Core Values:</h4>
                  <ul className="text-gray-600 mt-1">
                    <li>• Accuracy</li>
                    <li>• Security</li>
                    <li>• Compliance</li>
                    <li>• Empowerment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Who This Is For:
                  </h4>
                  <p className="text-gray-600 mt-1">
                    Pro se litigants, civil rights claimants, and users
                    navigating administrative and judicial systems without
                    retained counsel.
                  </p>
                </div>
              </div>
            </div>

            {/* Sign In/Up Options */}
            <div className="flex justify-center gap-4 mb-4">
              <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign In to AI Counsel</DialogTitle>
                    <DialogDescription>
                      Access your cases and continue your legal work.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Email" type="email" />
                    <Input placeholder="Password" type="password" />
                    <Button onClick={handleSignIn} className="w-full">
                      Sign In
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create AI Counsel Account</DialogTitle>
                    <DialogDescription>
                      Create a free account to save your cases and track
                      progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Full Name" />
                    <Input placeholder="Email" type="email" />
                    <Input placeholder="Password" type="password" />
                    <Input placeholder="Confirm Password" type="password" />
                    <Button onClick={handleSignUp} className="w-full">
                      Create Account
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <p className="text-center text-sm text-gray-600 mb-6">
              I'll interview you to understand your situation and help build
              your case.
            </p>

            {/* Personality Selector */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-center">
                Choose Your AI Handler's Personality:
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {PERSONALITIES.map((personality) => {
                  const Icon = personality.icon;
                  return (
                    <div
                      key={personality.id}
                      className={`cursor-pointer border rounded-lg p-4 transition-all ${
                        selectedPersonality === personality.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPersonality(personality.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className={`h-5 w-5 mt-0.5 ${
                            selectedPersonality === personality.id
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {personality.name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {personality.description}
                          </p>
                          <p className="text-xs italic text-gray-500">
                            "{personality.example}"
                          </p>
                        </div>
                        {selectedPersonality === personality.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-red-800 mb-2">
                🔒 Red Line Agreement
              </h4>
              <p className="text-sm text-red-700 mb-3">
                <strong>Legal Disclaimer - Educational Use Only:</strong> This
                system does not provide legal advice. You are solely responsible
                for any content, information, or actions taken based on this
                tool's output. By proceeding, you understand and agree that:
              </p>
              <ul className="text-xs text-red-600 space-y-1 mb-4">
                <li>
                  • This is an educational tool and cannot provide legal advice
                </li>
                <li>
                  • This app is for litigants ready to accept legal
                  responsibility
                </li>
                <li>
                  • Always consult with a qualified attorney for legal advice
                  specific to your situation
                </li>
                <li>
                  • No attorney-client relationship is created through use of
                  this system
                </li>
                <li>
                  • You understand the risks of proceeding pro se (representing
                  yourself)
                </li>
              </ul>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="agree-terms" className="text-sm text-red-700">
                  I understand and agree to these terms. I am ready to accept
                  legal responsibility and proceed with educational guidance
                  only.
                </label>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <Button
                onClick={handleStartInterview}
                size="lg"
                disabled={!agreedToTerms}
                className={`px-8 py-3 ${
                  agreedToTerms
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Bot className="h-5 w-5 mr-2" />I Understand & Agree - Start
                Interview
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                Free • Privacy protected • Educational use only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

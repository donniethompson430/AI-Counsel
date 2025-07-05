/**
 * DASHBOARD 1: PUBLIC ACCESS LAYER (The Lobby)
 *
 * Who sees it? Anyone who opens the app (unauthenticated)
 * Purpose: Welcome, inform, reassure, and filter for serious users only
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Bot, UserPlus, LogIn } from "lucide-react";
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

export default function PublicDashboard() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Close dialog and proceed to Dashboard 2 (agreement already checked)
    setIsSignInOpen(false);
    navigate("/handler-dashboard", {
      state: {
        fromPublic: true,
        userType: "returning",
      },
    });
  };

  const handleSignUp = () => {
    // Close dialog and proceed to Dashboard 2 (agreement already checked)
    setIsSignUpOpen(false);
    navigate("/handler-dashboard", {
      state: {
        fromPublic: true,
        userType: "new",
      },
    });
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
            <p className="text-sm text-blue-700 text-right italic">
              — g. Thompson
            </p>
          </div>
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

            <p className="text-center text-sm text-gray-600 mb-6">
              I'll interview you to understand your situation and help build
              your case.
            </p>

            {/* Legal Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-gray-800 mb-2">
                🔒 Important Agreement
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Legal Disclaimer - Educational Use Only:</strong> This
                system does not provide legal advice. You are solely responsible
                for any content, information, or actions taken based on this
                tool's output. By proceeding, you understand and agree that:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
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
                <label htmlFor="agree-terms" className="text-sm text-gray-700">
                  I understand and agree to these terms. I am ready to accept
                  legal responsibility and proceed with educational guidance
                  only.
                </label>
              </div>
            </div>

            {/* Sign In/Up Options */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                To continue, please sign in or create an account:
              </p>

              <div className="flex justify-center gap-4 mb-4">
                <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 ${!agreedToTerms ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!agreedToTerms}
                    >
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
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 ${!agreedToTerms ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!agreedToTerms}
                    >
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

              <p className="text-xs text-gray-500">
                Free • Privacy protected • Educational use only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewLawyerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerId: string;
  lawyerName: string;
  caseId: string;
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function ReviewLawyerDialog({
  open,
  onOpenChange,
  lawyerId,
  lawyerName,
  caseId,
}: ReviewLawyerDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await fetch(`/api/lawyers/${lawyerId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          rating,
          review_text: reviewText || null,
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setRating(0);
      setHoveredRating(0);
      setReviewText("");
      setSubmitted(false);
    }, 300);
  };

  const activeRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Thank You!
            </h3>
            <p className="text-slate-500 mb-1">
              Your review for{" "}
              <span className="font-semibold text-slate-700">
                {lawyerName}
              </span>{" "}
              has been submitted.
            </p>
            <div className="flex items-center justify-center gap-0.5 my-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-slate-400">
              Your feedback helps other clients find great lawyers.
            </p>
            <Button
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl px-8"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Rate Your Experience
              </DialogTitle>
              <DialogDescription>
                How was your experience working with{" "}
                <span className="font-semibold text-slate-700">
                  {lawyerName}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Star rating */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setHoveredRating(i + 1)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(i + 1)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-10 w-10 transition-colors",
                          i < activeRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200 hover:text-amber-200 hover:fill-amber-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {activeRating > 0 && (
                  <p className="text-sm font-medium text-amber-600">
                    {RATING_LABELS[activeRating]}
                  </p>
                )}
              </div>

              {/* Review text */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Write a review (optional)
                </label>
                <Textarea
                  placeholder="Tell others about your experience with this lawyer..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="rounded-lg resize-none"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Your review will be visible to other clients looking for
                  lawyers.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={handleClose}
              >
                Skip
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-2"
                disabled={rating === 0 || submitting}
                onClick={handleSubmit}
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

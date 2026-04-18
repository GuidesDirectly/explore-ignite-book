import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  guideUserId: string;
  reviewerName: string;
  reviewerEmail?: string;
  onSubmitted?: () => void;
}

const LeaveReviewDialog = ({ open, onOpenChange, bookingId, guideUserId, reviewerName, reviewerEmail, onSubmitted }: Props) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      guide_user_id: guideUserId,
      reviewer_name: reviewerName,
      reviewer_email: reviewerEmail ?? null,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not submit review", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thank you!", description: "Your review has been submitted." });
    if (rating >= 9) {
      window.open("https://g.page/r/iguidetours/review", "_blank");
    }
    onOpenChange(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>Rate your experience from 1 to 10.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm font-medium transition ${
                    rating >= n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
                  }`}
                  aria-label={`Rate ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment" className="mb-2 block">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what you loved…"
              maxLength={2000}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              <Star className="w-4 h-4 mr-1" /> {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveReviewDialog;

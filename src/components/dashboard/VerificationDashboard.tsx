import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GuideBadge, { type BadgeType } from "@/components/GuideBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  IdCard,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  ZoomIn,
  RotateCw,
  Maximize2,
  Calendar,
  User,
  MapPin,
  Mail,
} from "lucide-react";

interface VerificationRequest {
  id: string;
  guide_user_id: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
}

interface VerificationDocument {
  id: string;
  request_id: string;
  file_url: string;
  doc_type: string;
  verified: boolean;
  created_at: string;
}

interface GuideBadgeRow {
  id: string;
  guide_user_id: string;
  badge_type: BadgeType;
  issued_at: string;
  expires_at: string | null;
  issued_by: string | null;
  notes: string | null;
}

interface GuideInfo {
  user_id: string;
  form_data: {
    firstName: string;
    lastName: string;
    email?: string;
    licenseNumber?: string;
    licensingAuthority?: string;
  };
  service_areas: string[] | null;
  status: string;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

const VerificationDashboard = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [documents, setDocuments] = useState<Record<string, VerificationDocument[]>>({});
  const [badges, setBadges] = useState<GuideBadgeRow[]>([]);
  const [guideInfoMap, setGuideInfoMap] = useState<Record<string, GuideInfo>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Review modal state
  const [reviewingRequest, setReviewingRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedBadgeType, setSelectedBadgeType] = useState<BadgeType>("licensed_verified");
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(false);

  // Document viewer state
  const [viewingDoc, setViewingDoc] = useState<VerificationDocument | null>(null);
  const [docRotation, setDocRotation] = useState(0);

  // Badge management modal
  const [managingBadgesFor, setManagingBadgesFor] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [reqRes, badgeRes, guideRes] = await Promise.all([
      supabase.from("verification_requests").select("*").order("submitted_at", { ascending: false }),
      supabase.from("guide_badges").select("*").order("issued_at", { ascending: false }),
      supabase.from("guide_profiles").select("user_id, form_data, service_areas, status"),
    ]);

    if (reqRes.data) {
      setRequests(reqRes.data as VerificationRequest[]);
      // Fetch documents for all requests
      const requestIds = reqRes.data.map((r: any) => r.id);
      if (requestIds.length > 0) {
        const { data: docs } = await supabase
          .from("verification_documents")
          .select("*")
          .in("request_id", requestIds);
        if (docs) {
          const grouped: Record<string, VerificationDocument[]> = {};
          docs.forEach((d: any) => {
            if (!grouped[d.request_id]) grouped[d.request_id] = [];
            grouped[d.request_id].push(d as VerificationDocument);
          });
          setDocuments(grouped);
        }
      }
    }

    if (badgeRes.data) setBadges(badgeRes.data as GuideBadgeRow[]);

    if (guideRes.data) {
      const map: Record<string, GuideInfo> = {};
      (guideRes.data as any[]).forEach((g) => {
        map[g.user_id] = g;
      });
      setGuideInfoMap(map);
    }

    setLoading(false);
  };

  const getGuideInfo = (guideUserId: string) => guideInfoMap[guideUserId];
  const getGuideBadges = (guideUserId: string) => badges.filter((b) => b.guide_user_id === guideUserId);
  const getRequestDocs = (requestId: string) => documents[requestId] || [];

  const approveRequest = async () => {
    if (!reviewingRequest) return;
    setApproving(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Update request status
    const { error: reqErr } = await supabase
      .from("verification_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        notes: reviewNotes || null,
      } as any)
      .eq("id", reviewingRequest.id);

    if (reqErr) {
      toast.error("Failed to approve request");
      setApproving(false);
      return;
    }

    // Mark documents as verified
    const docs = getRequestDocs(reviewingRequest.id);
    if (docs.length > 0) {
      await supabase
        .from("verification_documents")
        .update({ verified: true } as any)
        .in("id", docs.map((d) => d.id));
    }

    // Assign badge
    const { error: badgeErr } = await supabase.from("guide_badges").insert({
      guide_user_id: reviewingRequest.guide_user_id,
      badge_type: selectedBadgeType,
      issued_by: user?.id,
      notes: reviewNotes || null,
    } as any);

    if (badgeErr) {
      toast.error("Request approved but badge assignment failed");
    }

    // Log audit
    await supabase.from("verification_audit_log").insert({
      admin_id: user?.id,
      action: "approve",
      target_guide_id: reviewingRequest.guide_user_id,
      target_request_id: reviewingRequest.id,
      metadata: { badge_type: selectedBadgeType, notes: reviewNotes },
    } as any);

    toast.success("Guide verified successfully", {
      description: `Badge "${selectedBadgeType.replace("_", " ")}" assigned.`,
    });

    setReviewingRequest(null);
    setReviewNotes("");
    setApproving(false);
    fetchAll();
  };

  const rejectRequest = async () => {
    if (!reviewingRequest) return;
    if (!reviewNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setRejecting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
        notes: reviewNotes,
      } as any)
      .eq("id", reviewingRequest.id);

    if (error) {
      toast.error("Failed to reject request");
      setRejecting(false);
      return;
    }

    await supabase.from("verification_audit_log").insert({
      admin_id: user?.id,
      action: "reject",
      target_guide_id: reviewingRequest.guide_user_id,
      target_request_id: reviewingRequest.id,
      metadata: { notes: reviewNotes },
    } as any);

    toast.success("Request rejected");
    setReviewingRequest(null);
    setReviewNotes("");
    setRejecting(false);
    fetchAll();
  };

  const removeBadge = async (badge: GuideBadgeRow) => {
    if (!confirm("Remove this badge?")) return;
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("guide_badges").delete().eq("id", badge.id);
    await supabase.from("verification_audit_log").insert({
      admin_id: user?.id,
      action: "remove_badge",
      target_guide_id: badge.guide_user_id,
      metadata: { badge_type: badge.badge_type },
    } as any);

    toast.success("Badge removed");
    fetchAll();
  };

  const filteredRequests = filterStatus === "all"
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // Expiring badges (within 30 days)
  const expiringBadges = badges.filter((b) => {
    if (!b.expires_at) return false;
    const daysUntil = (new Date(b.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 30;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => setFilterStatus("pending")} className={`bg-card rounded-xl border p-4 text-left transition-all ${filterStatus === "pending" ? "border-amber-500 ring-1 ring-amber-500/30" : "border-border hover:border-amber-500/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
        </button>
        <button onClick={() => setFilterStatus("approved")} className={`bg-card rounded-xl border p-4 text-left transition-all ${filterStatus === "approved" ? "border-green-500 ring-1 ring-green-500/30" : "border-border hover:border-green-500/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Approved</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
        </button>
        <button onClick={() => setFilterStatus("rejected")} className={`bg-card rounded-xl border p-4 text-left transition-all ${filterStatus === "rejected" ? "border-red-500 ring-1 ring-red-500/30" : "border-border hover:border-red-500/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-muted-foreground uppercase">Rejected</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
        </button>
        <button onClick={() => setFilterStatus("all")} className={`bg-card rounded-xl border p-4 text-left transition-all ${filterStatus === "all" ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase">All</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{requests.length}</p>
        </button>
      </div>

      {/* Expiring badges warning */}
      {expiringBadges.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">Expiring Credentials</p>
            <p className="text-sm text-muted-foreground">{expiringBadges.length} badge(s) expire within 30 days.</p>
            <div className="mt-2 space-y-1">
              {expiringBadges.map((b) => {
                const guide = getGuideInfo(b.guide_user_id);
                const daysLeft = Math.ceil((new Date(b.expires_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={b.id} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {guide ? `${guide.form_data.firstName} ${guide.form_data.lastName}` : b.guide_user_id.slice(0, 8)}
                    </span>
                    {" — "}{b.badge_type.replace(/_/g, " ")} — expires in {daysLeft} days
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Verification Requests List */}
      {filteredRequests.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No {filterStatus !== "all" ? filterStatus : ""} verification requests.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const guide = getGuideInfo(req.guide_user_id);
            const docs = getRequestDocs(req.id);
            const guideBadges = getGuideBadges(req.guide_user_id);
            const statusColor =
              req.status === "approved" ? "bg-green-500/10 text-green-700 border-green-500/30" :
              req.status === "rejected" ? "bg-red-500/10 text-red-700 border-red-500/30" :
              "bg-amber-500/10 text-amber-700 border-amber-500/30";

            return (
              <div key={req.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Guide info */}
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {guide ? `${guide.form_data.firstName} ${guide.form_data.lastName}` : "Unknown Guide"}
                        </h3>
                        {guide?.form_data.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {guide.form_data.email}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${statusColor}`}>
                        {req.status}
                      </Badge>
                    </div>

                    {/* Location + date */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      {guide?.service_areas && guide.service_areas.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {guide.service_areas.join(", ")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Submitted {new Date(req.submitted_at).toLocaleDateString()}
                      </span>
                      {guide?.form_data.licenseNumber && (
                        <span className="flex items-center gap-1">
                          <IdCard className="w-3 h-3" /> License: {guide.form_data.licenseNumber}
                        </span>
                      )}
                    </div>

                    {/* Documents */}
                    {docs.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                          Documents ({docs.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {docs.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => { setViewingDoc(doc); setDocRotation(0); }}
                              className="flex items-center gap-1.5 text-xs bg-muted/50 hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-primary" />
                              <span>{doc.doc_type}</span>
                              {doc.verified && <CheckCircle className="w-3 h-3 text-green-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current badges */}
                    {guideBadges.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Badges:</span>
                        {guideBadges.map((b) => (
                          <GuideBadge key={b.id} type={b.badge_type} size="sm" />
                        ))}
                      </div>
                    )}

                    {/* Review notes */}
                    {req.notes && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <span className="font-medium">Notes:</span> {req.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {req.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500/30 text-green-700 hover:bg-green-500/10"
                        onClick={() => {
                          setReviewingRequest(req);
                          setReviewNotes("");
                          setSelectedBadgeType("licensed_verified");
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Review
                      </Button>
                    )}
                    {req.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManagingBadgesFor(req.guide_user_id)}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Badges
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Badges Overview (when no requests or viewing all) */}
      {badges.length > 0 && filterStatus === "all" && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Active Badges ({badges.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((b) => {
              const guide = getGuideInfo(b.guide_user_id);
              return (
                <div key={b.id} className="bg-card rounded-lg border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GuideBadge type={b.badge_type} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {guide ? `${guide.form_data.firstName} ${guide.form_data.lastName}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.issued_at).toLocaleDateString()}
                        {b.expires_at && ` • Exp: ${new Date(b.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => removeBadge(b)}>
                    <XCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== REVIEW MODAL ===== */}
      <Dialog open={!!reviewingRequest} onOpenChange={(open) => { if (!open) setReviewingRequest(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>
              {(() => {
                if (!reviewingRequest) return "";
                const g = getGuideInfo(reviewingRequest.guide_user_id);
                return g ? `${g.form_data.firstName} ${g.form_data.lastName}` : "Guide";
              })()}
            </DialogDescription>
          </DialogHeader>

          {reviewingRequest && (
            <div className="space-y-4">
              {/* Documents in this request */}
              <div>
                <p className="text-sm font-medium mb-2">Submitted Documents</p>
                {getRequestDocs(reviewingRequest.id).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No documents attached.</p>
                ) : (
                  <div className="space-y-1.5">
                    {getRequestDocs(reviewingRequest.id).map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => { setViewingDoc(doc); setDocRotation(0); }}
                        className="w-full flex items-center gap-2 text-sm bg-muted/50 hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="flex-1">{doc.doc_type}</span>
                        <span className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Badge type selection */}
              <div>
                <p className="text-sm font-medium mb-2">Assign Badge Type</p>
                <div className="flex flex-col gap-2">
                  {(["licensed_verified", "permit_confirmed", "certification_pending"] as BadgeType[]).map((bt) => (
                    <button
                      key={bt}
                      onClick={() => setSelectedBadgeType(bt)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${selectedBadgeType === bt ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}
                    >
                      <GuideBadge type={bt} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm font-medium mb-1">Notes {rejecting ? <span className="text-destructive">(required for rejection)</span> : "(optional)"}</p>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add verification notes..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={rejectRequest}
              disabled={rejecting || approving}
            >
              <XCircle className="w-4 h-4 mr-1" />
              {rejecting ? "Rejecting…" : "Reject"}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={approveRequest}
              disabled={approving || rejecting}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {approving ? "Approving…" : "Approve & Assign Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DOCUMENT VIEWER MODAL ===== */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => { if (!open) setViewingDoc(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingDoc?.doc_type || "Document"}
              {viewingDoc?.verified && (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30 text-xs ml-2">
                  Verified
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {viewingDoc && (
            <div className="space-y-3">
              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setDocRotation((r) => (r + 90) % 360)}>
                  <RotateCw className="w-4 h-4 mr-1" /> Rotate
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(viewingDoc.file_url, "_blank")}>
                  <Maximize2 className="w-4 h-4 mr-1" /> Fullscreen
                </Button>
                <a href={viewingDoc.file_url} download className="inline-flex">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </a>
              </div>

              {/* Preview */}
              <div className="bg-muted/50 rounded-lg border border-border overflow-hidden flex items-center justify-center min-h-[400px]">
                {viewingDoc.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={viewingDoc.file_url}
                    alt={viewingDoc.doc_type}
                    className="max-w-full max-h-[60vh] object-contain transition-transform duration-200"
                    style={{ transform: `rotate(${docRotation}deg)` }}
                  />
                ) : viewingDoc.file_url.match(/\.pdf$/i) ? (
                  <iframe
                    src={viewingDoc.file_url}
                    className="w-full h-[60vh]"
                    title={viewingDoc.doc_type}
                  />
                ) : (
                  <div className="text-center p-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                    <a href={viewingDoc.file_url} download>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== BADGE MANAGEMENT MODAL ===== */}
      <Dialog open={!!managingBadgesFor} onOpenChange={(open) => { if (!open) setManagingBadgesFor(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Badges</DialogTitle>
            <DialogDescription>
              {(() => {
                if (!managingBadgesFor) return "";
                const g = getGuideInfo(managingBadgesFor);
                return g ? `${g.form_data.firstName} ${g.form_data.lastName}` : "";
              })()}
            </DialogDescription>
          </DialogHeader>

          {managingBadgesFor && (
            <div className="space-y-3">
              {getGuideBadges(managingBadgesFor).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No active badges.</p>
              ) : (
                getGuideBadges(managingBadgesFor).map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border border-border">
                    <div>
                      <GuideBadge type={b.badge_type} size="md" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Issued: {new Date(b.issued_at).toLocaleDateString()}
                        {b.expires_at && ` • Expires: ${new Date(b.expires_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeBadge(b)}>
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legal footer */}
      <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
        Verification confirms documents were reviewed but does not guarantee legal authorization beyond submitted proof.
      </p>
    </div>
  );
};

export default VerificationDashboard;

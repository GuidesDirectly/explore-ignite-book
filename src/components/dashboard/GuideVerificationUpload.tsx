import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import GuideBadge from "@/components/GuideBadge";
import type { BadgeType } from "@/components/GuideBadge";
import { scanFileForViruses } from "@/lib/scanUpload";
import {
  ShieldCheck,
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VerificationRequest {
  id: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
}

interface VerificationDoc {
  id: string;
  request_id: string;
  doc_type: string;
  file_url: string;
  verified: boolean;
  created_at: string;
}

interface GuideBadgeRow {
  id: string;
  badge_type: BadgeType;
  issued_at: string;
  expires_at: string | null;
}

const DOC_TYPES = [
  { value: "license", label: "Professional License" },
  { value: "permit", label: "Local Permit" },
  { value: "certificate", label: "Certification" },
  { value: "id", label: "Government ID" },
];

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface Props {
  userId: string;
}

const GuideVerificationUpload = ({ userId }: Props) => {
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [documents, setDocuments] = useState<VerificationDoc[]>([]);
  const [badges, setBadges] = useState<GuideBadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("license");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [reqRes, badgeRes] = await Promise.all([
      supabase
        .from("verification_requests")
        .select("*")
        .eq("guide_user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(1),
      supabase
        .from("guide_badges")
        .select("id, badge_type, issued_at, expires_at")
        .eq("guide_user_id", userId),
    ]);

    const req = reqRes.data?.[0] as VerificationRequest | undefined;
    setRequest(req || null);

    if (req) {
      const { data: docs } = await supabase
        .from("verification_documents")
        .select("*")
        .eq("request_id", req.id)
        .order("created_at", { ascending: true });
      setDocuments((docs as VerificationDoc[]) || []);
    } else {
      setDocuments([]);
    }

    setBadges((badgeRes.data as GuideBadgeRow[]) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createRequestIfNeeded = async (): Promise<string | null> => {
    if (request && request.status !== "rejected") return request.id;

    // Create new request
    const { data, error } = await supabase
      .from("verification_requests")
      .insert({ guide_user_id: userId } as any)
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Failed to create verification request");
      return null;
    }

    return data.id;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Accepted: PDF, JPG, PNG, WebP");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum 10MB.");
      return;
    }

    setUploading(true);

    // Virus scan
    const scanResult = await scanFileForViruses(file);
    if (!scanResult.clean) {
      toast.error("File rejected — potential security threat detected");
      setUploading(false);
      return;
    }

    const requestId = await createRequestIfNeeded();
    if (!requestId) {
      setUploading(false);
      return;
    }

    // Upload to guide-licenses bucket
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const fileName = `${userId}/${selectedDocType}-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("guide-licenses")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (uploadErr) {
      toast.error("Upload failed: " + uploadErr.message);
      setUploading(false);
      return;
    }

    // Get signed URL (private bucket)
    const { data: urlData } = await supabase.storage
      .from("guide-licenses")
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    const fileUrl = urlData?.signedUrl || fileName;

    // Save document record
    const { error: docErr } = await supabase.from("verification_documents").insert({
      request_id: requestId,
      doc_type: selectedDocType,
      file_url: fileUrl,
    } as any);

    if (docErr) {
      toast.error("Failed to save document record");
    } else {
      toast.success("Document uploaded successfully");
    }

    setUploading(false);
    e.target.value = "";
    fetchData();
  };

  const deleteDocument = async (doc: VerificationDoc) => {
    setDeleting(doc.id);
    // Extract file path from URL for deletion
    await supabase.from("verification_documents").delete().eq("id", doc.id);
    toast.success("Document removed");
    setDeleting(null);
    fetchData();
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-700 border-green-500/30";
      case "rejected":
        return "bg-red-500/10 text-red-700 border-red-500/30";
      default:
        return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    }
  };

  if (loading) {
    return (
      <section className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-2xl border border-border/50 p-6">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-primary" />
        Credential Verification
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        Upload your professional license, permits, or certifications to earn trust badges on your profile.
      </p>

      {/* Current Badges */}
      {badges.length > 0 && (
        <div className="mb-5 p-4 bg-muted/30 rounded-xl border border-border/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Your Active Badges
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <GuideBadge key={b.id} type={b.badge_type} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Request Status */}
      {request && (
        <div className={`mb-5 p-4 rounded-xl border ${statusColor(request.status)}`}>
          <div className="flex items-center gap-2 mb-1">
            {statusIcon(request.status)}
            <span className="font-semibold text-sm">{statusLabel(request.status)}</span>
            <Badge variant="outline" className="text-xs ml-auto">
              Submitted {new Date(request.submitted_at).toLocaleDateString()}
            </Badge>
          </div>
          {request.notes && (
            <p className="text-sm mt-2 opacity-80">
              <span className="font-medium">Admin notes:</span> {request.notes}
            </p>
          )}
          {request.status === "rejected" && (
            <p className="text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              You can resubmit documents below.
            </p>
          )}
        </div>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Submitted Documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30"
              >
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {doc.doc_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                {doc.verified ? (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {!doc.verified && request?.status !== "approved" && (
                  <button
                    onClick={() => deleteDocument(doc)}
                    disabled={deleting === doc.id}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="Remove document"
                  >
                    {deleting === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload New Document */}
      {(!request || request.status === "pending" || request.status === "rejected") && (
        <div className="border-2 border-dashed border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">Upload a Document</p>
              <p className="text-xs text-muted-foreground">
                Accepted: PDF, JPG, PNG, WebP. Max 10MB.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  uploading
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Compliance note */}
      <p className="text-xs text-muted-foreground mt-4 italic">
        Guides are responsible for complying with all local licensing requirements.
      </p>
    </section>
  );
};

export default GuideVerificationUpload;

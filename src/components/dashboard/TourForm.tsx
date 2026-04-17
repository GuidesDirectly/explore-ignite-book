import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  X,
  MapPin,
  DollarSign,
  Users,
  Tag,
  Shield,
  Mountain,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  Camera,
  FileText,
} from "lucide-react";
import TourPhotosUploader from "./TourPhotosUploader";

interface TourFormProps {
  userId: string;
  guideProfileId: string | null;
  onSaved?: () => void;
  existingTour?: any;
}

const HIGHLIGHT_SUGGESTIONS = [
  "Walking",
  "Food Included",
  "Kid Friendly",
  "Wheelchair Accessible",
  "Photography",
  "Night Tour",
  "Private Available",
  "Transport Included",
  "Skip the Line",
  "Local Experience",
  "Adventure",
  "Cultural",
  "Historical",
  "Outdoor",
];

const BRING_SUGGESTIONS = [
  "Comfortable shoes",
  "Water bottle",
  "Sunscreen",
  "Hat",
  "Valid ID",
  "Camera",
  "Cash for tips",
  "Light jacket",
  "Snacks",
];

// Expanded to 9 tour types per spec
const CATEGORIES = [
  { value: "walking", label: "Walking Tour" },
  { value: "driving", label: "Driving Tour" },
  { value: "private", label: "Private Tour" },
  { value: "group", label: "Group Tour" },
  { value: "historical", label: "Historical Tour" },
  { value: "food", label: "Food Tour" },
  { value: "cultural", label: "Cultural Tour" },
  { value: "multi-day", label: "Multi-Day Tour" },
  { value: "custom", label: "Custom Tour" },
];

const DEFAULT_REQUIRED_PHOTOS = 3;

const TourForm = ({ userId, guideProfileId, onSaved, existingTour }: TourFormProps) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>("basics");
  const [requiredPhotos, setRequiredPhotos] = useState(DEFAULT_REQUIRED_PHOTOS);

  // Section A: Basics
  const [title, setTitle] = useState(existingTour?.title || "");
  const [description, setDescription] = useState(existingTour?.description || "");
  const [durationValue, setDurationValue] = useState<number>(existingTour?.duration_value || 2);
  const [durationUnit, setDurationUnit] = useState(existingTour?.duration_unit || "hours");
  const [pricePerPerson, setPricePerPerson] = useState<number>(existingTour?.price_per_person || 0);
  const [currency, setCurrency] = useState(existingTour?.currency || "USD");
  const [meetingPoint, setMeetingPoint] = useState(existingTour?.meeting_point || "");
  const [minGroupSize, setMinGroupSize] = useState<number>(existingTour?.min_group_size || 1);
  const [maxGroupSize, setMaxGroupSize] = useState<number>(existingTour?.max_group_size || 10);
  const [city, setCity] = useState(existingTour?.city || "");
  const [country, setCountry] = useState(existingTour?.country || "");
  const [category, setCategory] = useState(existingTour?.category || "walking");

  // Section B: Experience
  const [highlights, setHighlights] = useState<string[]>(existingTour?.highlights || []);
  const [highlightInput, setHighlightInput] = useState("");
  const [detailedItinerary, setDetailedItinerary] = useState(existingTour?.detailed_itinerary || "");
  const [whatToBring, setWhatToBring] = useState<string[]>(existingTour?.what_to_bring || []);
  const [inclusions, setInclusions] = useState(existingTour?.inclusions?.join("\n") || "");
  const [exclusions, setExclusions] = useState(existingTour?.exclusions?.join("\n") || "");

  // Section C: Photos
  const [photos, setPhotos] = useState<string[]>(existingTour?.photos || []);

  // Section D: Logistics
  const [cancellationPolicy, setCancellationPolicy] = useState(
    existingTour?.cancellation_policy || "flexible"
  );
  const [difficultyLevel, setDifficultyLevel] = useState<number>(
    existingTour?.difficulty_level || 1
  );

  // Read app_settings for required photo count
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "required_tour_photos")
        .maybeSingle();
      if (data?.value != null) {
        const parsed = typeof data.value === "number" ? data.value : Number(data.value);
        if (Number.isFinite(parsed) && parsed > 0) setRequiredPhotos(parsed);
      }
    })();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const addHighlight = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !highlights.includes(trimmed) && highlights.length < 10) {
      setHighlights([...highlights, trimmed]);
      setHighlightInput("");
    }
  };

  const removeHighlight = (tag: string) => {
    setHighlights(highlights.filter((h) => h !== tag));
  };

  const toggleBringItem = (item: string) => {
    if (whatToBring.includes(item)) {
      setWhatToBring(whatToBring.filter((i) => i !== item));
    } else {
      setWhatToBring([...whatToBring, item]);
    }
  };

  const handleSave = async (publishStatus: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Tour title is required.");
      return;
    }
    if (pricePerPerson < 0) {
      toast.error("Price per person cannot be negative.");
      return;
    }
    if (!city.trim()) {
      toast.error("City is required for searchability.");
      return;
    }
    if (publishStatus === "published" && photos.length < requiredPhotos) {
      toast.error(`Please add at least ${requiredPhotos} photos before publishing.`);
      return;
    }
    if (minGroupSize > maxGroupSize) {
      toast.error("Min group size cannot exceed max group size.");
      return;
    }

    setSaving(true);

    const tourData: any = {
      guide_user_id: userId,
      guide_profile_id: guideProfileId,
      title: title.trim(),
      description: description.trim() || null,
      duration_value: durationValue,
      duration_unit: durationUnit,
      price_per_person: pricePerPerson,
      currency,
      meeting_point: meetingPoint.trim() || null,
      min_group_size: minGroupSize,
      max_group_size: maxGroupSize,
      city: city.trim(),
      country: country.trim() || null,
      category,
      highlights,
      detailed_itinerary: detailedItinerary.trim() || null,
      what_to_bring: whatToBring,
      inclusions: inclusions.split("\n").filter((l: string) => l.trim()),
      exclusions: exclusions.split("\n").filter((l: string) => l.trim()),
      cancellation_policy: cancellationPolicy,
      difficulty_level: difficultyLevel,
      status: publishStatus,
      photos,
      cover_image_url: photos[0] || null,
    };

    let error;

    if (existingTour?.id) {
      const res = await supabase
        .from("tours")
        .update(tourData)
        .eq("id", existingTour.id);
      error = res.error;
    } else {
      const res = await supabase.from("tours").insert(tourData);
      error = res.error;
    }

    if (error) {
      console.error("Tour save error:", error);
      toast.error("Failed to save tour. Please try again.");
    } else {
      toast.success(
        publishStatus === "published"
          ? "Tour published successfully!"
          : "Tour saved as draft."
      );
      onSaved?.();
    }

    setSaving(false);
  };

  const SectionHeader = ({
    id,
    icon: Icon,
    label,
    sublabel,
  }: {
    id: string;
    icon: any;
    label: string;
    sublabel: string;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>
      {expandedSection === id ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  const canPublish = photos.length >= requiredPhotos;

  return (
    <div className="space-y-4">
      {/* Section A: The Basics */}
      <SectionHeader
        id="basics"
        icon={MapPin}
        label="The Basics"
        sublabel="Title, price, duration, meeting point"
      />
      {expandedSection === "basics" && (
        <div className="space-y-4 px-2">
          <div>
            <Label htmlFor="tour-title">Tour Title *</Label>
            <Input
              id="tour-title"
              placeholder='e.g. "Secret Rooftops & Tapas of Madrid"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration-value">Duration *</Label>
              <div className="flex gap-2">
                <Input
                  id="duration-value"
                  type="number"
                  min={0.5}
                  max={30}
                  step={0.5}
                  value={durationValue}
                  onChange={(e) => setDurationValue(parseFloat(e.target.value) || 1)}
                  className="w-20"
                />
                <Select value={durationUnit} onValueChange={setDurationUnit}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="price">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Price per Person
              </Label>
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1}
                  value={pricePerPerson}
                  onChange={(e) => setPricePerPerson(parseFloat(e.target.value) || 0)}
                  className="flex-1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Leave at 0 to show "Contact for pricing".
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="meeting-point">
              <MapPin className="w-3 h-3 inline mr-1" />
              Meeting Point
            </Label>
            <Input
              id="meeting-point"
              placeholder="e.g. Plaza Mayor, Main Entrance"
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min-group">
                <Users className="w-3 h-3 inline mr-1" />
                Min Size
              </Label>
              <Input
                id="min-group"
                type="number"
                min={1}
                max={200}
                value={minGroupSize}
                onChange={(e) => setMinGroupSize(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="max-group">
                <Users className="w-3 h-3 inline mr-1" />
                Max Size
              </Label>
              <Input
                id="max-group"
                type="number"
                min={1}
                max={200}
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(parseInt(e.target.value) || 10)}
              />
            </div>
            <div>
              <Label htmlFor="category">Tour Type</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g. Madrid"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g. Spain"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>
        </div>
      )}

      {/* Section: About Your Tour (description) */}
      <SectionHeader
        id="about"
        icon={FileText}
        label="About Your Tour"
        sublabel="Description that travelers will read"
      />
      {expandedSection === "about" && (
        <div className="space-y-3 px-2">
          <div>
            <Label htmlFor="description">Tour Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your tour in detail. What makes it special? What will travelers see, do, and experience?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {description.length} / 2000 characters
              {description.length > 0 && description.length < 200 && (
                <span className="text-amber-600 ml-2">
                  • Tip: aim for 200+ characters for richer listings
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Section B: The Experience */}
      <SectionHeader
        id="experience"
        icon={Tag}
        label="The Experience"
        sublabel="Highlights, itinerary, what to bring"
      />
      {expandedSection === "experience" && (
        <div className="space-y-4 px-2">
          <div>
            <Label>At-a-Glance Highlights</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {highlights.map((h) => (
                <Badge key={h} variant="secondary" className="gap-1">
                  {h}
                  <button type="button" onClick={() => removeHighlight(h)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add custom highlight..."
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlight(highlightInput);
                  }
                }}
                maxLength={50}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addHighlight(highlightInput)}
                disabled={!highlightInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HIGHLIGHT_SUGGESTIONS.filter((s) => !highlights.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addHighlight(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="itinerary">Detailed Itinerary</Label>
            <Textarea
              id="itinerary"
              placeholder="Describe your tour hour-by-hour or day-by-day..."
              value={detailedItinerary}
              onChange={(e) => setDetailedItinerary(e.target.value)}
              rows={6}
              maxLength={5000}
            />
          </div>

          <div>
            <Label>What to Bring</Label>
            <div className="flex flex-wrap gap-2">
              {BRING_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleBringItem(item)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    whatToBring.includes(item)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {whatToBring.includes(item) ? "✓ " : ""}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inclusions">Inclusions (one per line)</Label>
              <Textarea
                id="inclusions"
                placeholder={"Guide fee\nFood tastings\nMuseum tickets"}
                value={inclusions}
                onChange={(e) => setInclusions(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="exclusions">Exclusions (one per line)</Label>
              <Textarea
                id="exclusions"
                placeholder={"Transportation\nAlcoholic drinks\nSouvenirs"}
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>
      )}

      {/* Section C: Photos */}
      <SectionHeader
        id="photos"
        icon={Camera}
        label={`Photos${photos.length > 0 ? ` (${photos.length})` : ""}`}
        sublabel={`Min ${requiredPhotos} required to publish · first photo is the cover`}
      />
      {expandedSection === "photos" && (
        <div className="px-2">
          <TourPhotosUploader
            userId={userId}
            tourId={existingTour?.id}
            photos={photos}
            onChange={setPhotos}
            required={requiredPhotos}
          />
        </div>
      )}

      {/* Section D: Logistics */}
      <SectionHeader
        id="logistics"
        icon={Shield}
        label="Logistics & Policies"
        sublabel="Cancellation, difficulty, payouts"
      />
      {expandedSection === "logistics" && (
        <div className="space-y-4 px-2">
          <div>
            <Label htmlFor="cancellation">Cancellation Policy</Label>
            <Select value={cancellationPolicy} onValueChange={setCancellationPolicy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">
                  Flexible — Full refund up to 24 hours before
                </SelectItem>
                <SelectItem value="moderate">
                  Moderate — Full refund up to 5 days before
                </SelectItem>
                <SelectItem value="strict">
                  Strict — 50% refund up to 7 days before
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              <Mountain className="w-3 h-3 inline mr-1" />
              Difficulty Level
            </Label>
            <div className="flex items-center gap-3 mt-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficultyLevel(level)}
                  className={`w-10 h-10 rounded-lg border-2 font-bold text-sm transition-all ${
                    level <= difficultyLevel
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {level}
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {difficultyLevel === 1 && "Easy"}
                {difficultyLevel === 2 && "Moderate"}
                {difficultyLevel === 3 && "Challenging"}
                {difficultyLevel === 4 && "Difficult"}
                {difficultyLevel === 5 && "Extreme"}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <p className="text-sm font-medium text-foreground mb-1">
              <DollarSign className="w-4 h-4 inline mr-1 text-primary" />
              Payout Setup
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Connect your bank account via Stripe to receive payouts for bookings.
            </p>
            <Button variant="outline" size="sm" disabled>
              Connect with Stripe (Coming Soon)
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
        <Button
          onClick={() => handleSave("draft")}
          variant="outline"
          disabled={saving}
          className="flex-1"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="flex-1"
          title={!canPublish ? `Add ${requiredPhotos - photos.length} more photo(s) to publish` : undefined}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          Publish Now
        </Button>
      </div>
      {!canPublish && (
        <p className="text-xs text-muted-foreground text-center">
          You can save as draft any time. To publish, add at least {requiredPhotos} photos.
        </p>
      )}
    </div>
  );
};

export default TourForm;

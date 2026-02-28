import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Search,
  MapPin,
  Globe,
  Briefcase,
  User,
  Upload,
  Camera,
  ShieldCheck,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { translateOption, translateOptions } from "@/lib/translationHelpers";
import PasswordStrengthMeter, { isPasswordStrong } from "@/components/PasswordStrengthMeter";
import { checkPasswordBreached } from "@/lib/hibp";
import { scanFileForViruses } from "@/lib/scanUpload";


// Service area presets now come from the shared destinations data
import { ALL_DESTINATIONS, CONTINENTS, PILOT_CITY } from "@/data/destinations";
const AREA_OPTIONS = ALL_DESTINATIONS.map((d) => d.name);

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Japanese",
  "Russian",
  "Polish",
  "Portuguese",
  "Arabic",
  "Korean",
  "Italian",
  "Hindi",
  "Vietnamese",
  "Indonesian",
  "Dutch",
  "Thai",
  "Turkish",
  "Swedish",
  "Ukrainian",
  "Hebrew",
];

const SPECIALIZATION_OPTIONS = [
  "City Tours",
  "Ecotourism",
  "Cultural Exploration",
  "Nature Adventures",
  "Hiking & Wildlife",
  "Custom Itineraries",
  "History & Heritage",
  "Food & Culinary",
  "Art & Museums",
  "Architecture & Urban Design",
  "Photography Tours",
  "Family-Friendly",
  "Luxury & VIP",
  "Adventure & Sports",
  "Nightlife & Entertainment",
  "Religious & Spiritual Sites",
  "Wine & Brewery Tours",
  "Beach & Water Activities",
  "Shopping & Local Markets",
];

const TOUR_TYPE_OPTIONS = [
  "Private Tours",
  "Group Tours",
  "Walking Tours",
  "Driving Tours",
  "Multi-Day Tours",
];

const STEPS = [
  { icon: User, label: "Personal Info" },
  { icon: MapPin, label: "Service Areas" },
  { icon: Globe, label: "Languages" },
  { icon: Briefcase, label: "Specialties" },
  { icon: Camera, label: "Photo & Bio" },
  { icon: ShieldCheck, label: "Credentials" },
];

const GuideRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [profileExists, setProfileExists] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [tourTypes, setTourTypes] = useState<string[]>([]);
  const [biography, setBiography] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  // Credentials state
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licensingAuthority, setLicensingAuthority] = useState("");
  const [certifications, setCertifications] = useState("");
  const [licenseDoc, setLicenseDoc] = useState<File | null>(null);
  const [licenseDocName, setLicenseDocName] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [areaSearchQuery, setAreaSearchQuery] = useState("");

  // Auth check
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        setEmail(u.email || "");
        // Check if profile already exists
        const { data } = await supabase
          .from("guide_profiles")
          .select("id, form_data, current_step, service_areas, status")
          .eq("user_id", u.id)
          .maybeSingle();
        if (data) {
          setProfileExists(true);
          const fd = data.form_data as any;
          setFirstName(fd.firstName || "");
          setLastName(fd.lastName || "");
          setPhone(fd.phone || "");
          setAddress(fd.address || "");
          setLanguages(fd.languages || ["English"]);
          setSpecializations(fd.specializations || []);
          setTourTypes(fd.tourTypes || []);
          setBiography(fd.biography || "");
          setInsuranceCompany(fd.insuranceCompanyName || "");
          setInsurancePolicyNumber(fd.insurancePolicyNumber || "");
          setLicenseNumber(fd.licenseNumber || "");
          setLicensingAuthority(fd.licensingAuthority || "");
          setCertifications((fd.certifications || []).join(", "));
          setServiceAreas(data.service_areas || []);
          // Only restore step if still in draft; if already submitted, start fresh for re-editing
          if (data.status === "draft" && (data.current_step || 0) < 6) {
            setCurrentStep(data.current_step || 0);
          } else {
            setCurrentStep(0);
          }
        }
      }
      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) setEmail(u.email || "");
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (!isPasswordStrong(authPassword)) {
        toast.error("Password does not meet all strength requirements.");
        return;
      }

      // HIBP k-anonymity breach check — password hash prefix only, never the full password
      setCheckingBreach(true);
      const breached = await checkPasswordBreached(authPassword);
      setCheckingBreach(false);

      if (breached) {
        toast.error(
          "This password has appeared in known data breaches. Please choose another.",
          { duration: 6000 }
        );
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! You can now fill out your profile.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) toast.error(error.message);
    }
  };

  const toggleItem = (
    arr: string[],
    setArr: (v: string[]) => void,
    item: string
  ) => {
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_DOC_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

  const generateSafeFilename = (ext: string) =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext.toLowerCase()}`;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Profile photo must be a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("Profile photo must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    const digits = value.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError("Phone number must be at least 10 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.trim() && !isValidEmail(value.trim())) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return firstName.trim() && lastName.trim() && isValidEmail(email.trim()) && phone.replace(/\D/g, "").length >= 10 && address.trim().length > 0;
      case 1:
        return serviceAreas.length > 0;
      case 2:
        return languages.length > 0;
      case 3:
        return specializations.length > 0;
      case 4:
        return biography.trim().length >= 20;
      case 5:
        return (
          insuranceCompany.trim().length > 0 &&
          insurancePolicyNumber.trim().length > 0 &&
          licenseNumber.trim().length > 0 &&
          licensingAuthority.trim().length > 0
        );
      default:
        return true;
    }
  };

  const handleLicenseDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      toast.error("License document must be a PDF, JPG, PNG, or WebP file.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      toast.error("License document must be under 10 MB.");
      e.target.value = "";
      return;
    }
    setLicenseDoc(file);
    setLicenseDocName(file.name);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Upload profile photo — scan, validate MIME, rename to random filename
      if (profilePhoto) {
        if (!ALLOWED_IMAGE_TYPES.includes(profilePhoto.type)) {
          toast.error("Invalid profile photo type.");
          setSubmitting(false);
          return;
        }
        const photoScan = await scanFileForViruses(profilePhoto);
        if (!photoScan.clean) {
          toast.error("Profile photo failed security scan. Please use a different file.");
          setSubmitting(false);
          return;
        }
        const ext = profilePhoto.type === "image/png" ? "png" : profilePhoto.type === "image/webp" ? "webp" : "jpg";
        const safePhotoName = `profile-${generateSafeFilename(ext)}`;
        const { error: uploadError } = await supabase.storage
          .from("guide-photos")
          .upload(`${user.id}/${safePhotoName}`, profilePhoto, {
            upsert: false,
            contentType: profilePhoto.type,
          });
        if (uploadError) console.error("Photo upload error:", uploadError);
      }

      // Upload license doc — scan, validate MIME, rename to random filename, store in private bucket
      if (licenseDoc) {
        if (!ALLOWED_DOC_TYPES.includes(licenseDoc.type)) {
          toast.error("Invalid license document type.");
          setSubmitting(false);
          return;
        }
        const docScan = await scanFileForViruses(licenseDoc);
        if (!docScan.clean) {
          toast.error("License document failed security scan. Please use a different file.");
          setSubmitting(false);
          return;
        }
        const ext = licenseDoc.type === "application/pdf" ? "pdf" : licenseDoc.type === "image/png" ? "png" : licenseDoc.type === "image/webp" ? "webp" : "jpg";
        const safeLicenseName = `license-${generateSafeFilename(ext)}`;
        const { error: licenseUploadError } = await supabase.storage
          .from("guide-licenses")
          .upload(`${user.id}/${safeLicenseName}`, licenseDoc, {
            upsert: false,
            contentType: licenseDoc.type,
          });
        if (licenseUploadError) console.error("License doc upload error:", licenseUploadError);
      }


      const certList = certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const formData = {
        firstName,
        lastName,
        phone,
        address,
        languages,
        specializations,
        tourTypes,
        biography,
        insurance: true,
        insuranceCompanyName: insuranceCompany.trim(),
        insurancePolicyNumber: insurancePolicyNumber.trim(),
        licenseNumber: licenseNumber.trim(),
        licensingAuthority: licensingAuthority.trim(),
        certifications: certList,
      };

      let profileId: string | null = null;

      if (profileExists) {
        const { data: updatedProfile } = await supabase
          .from("guide_profiles")
          .update({
            form_data: formData,
            service_areas: serviceAreas,
            current_step: 6,
            status: "pending",
          } as any)
          .eq("user_id", user.id)
          .select("id")
          .single();
        profileId = updatedProfile?.id || null;
      } else {
        const { data: newProfile } = await supabase.from("guide_profiles").insert({
          user_id: user.id,
          form_data: formData,
          service_areas: serviceAreas,
          current_step: 6,
          status: "pending",
        } as any).select("id").single();
        profileId = newProfile?.id || null;
      }

      // Fire-and-forget: translate guide bio and name
      if (profileId && formData.biography) {
        supabase.functions.invoke("translate-content", {
          body: {
            table: "guide_profiles",
            record_id: profileId,
            fields: ["form_data.biography"],
          },
        }).catch(console.error);
      }

      // Send confirmation email to the guide
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "guide_application",
            data: { guideName: `${firstName} ${lastName}`, guideEmail: user.email },
          },
        });
      } catch (e) {
        console.error("Failed to send confirmation email:", e);
      }

      toast.success(t("guideRegister.submitted"));
      // Redirect to home and scroll to top after a short delay
      setTimeout(() => {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 2000);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-navy flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <img
              src={logoImg}
              alt="iGuide Tours"
              className="h-16 w-16 rounded-full object-cover mx-auto mb-4"
            />
            <h1 className="font-display text-2xl font-bold text-primary">
              {t("guideRegister.title")}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {t("guideRegister.authSubtitle")}
            </p>
          </div>
          <form
            onSubmit={handleAuth}
            className="space-y-4 bg-card/10 backdrop-blur-sm rounded-2xl p-6 border border-primary/10"
          >
            <Input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="bg-secondary/50 border-primary/20 text-primary-foreground"
            />
            <Input
              type="password"
              placeholder={isSignUp ? "Min 10 chars, mixed case, number & symbol" : "Password"}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="bg-secondary/50 border-primary/20 text-primary-foreground"
              minLength={isSignUp ? 10 : undefined}
            />
            {isSignUp && (
              <div className="bg-card/20 rounded-lg px-3 py-2">
                <PasswordStrengthMeter password={authPassword} />
              </div>
            )}
            <Button variant="hero" className="w-full" type="submit" disabled={checkingBreach}>
              {checkingBreach ? "Checking password safety…" : isSignUp ? t("guideRegister.signUp") : t("guideRegister.signIn")}
            </Button>
            {!isSignUp && (
              <a
                href="/forgot-password"
                className="block text-center text-primary text-sm font-medium hover:underline transition-colors"
              >
                Forgot password?
              </a>
            )}
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? t("guideRegister.haveAccount") : t("guideRegister.noAccount")}{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? t("guideRegister.signIn") : t("guideRegister.signUp")}
              </button>
            </p>
          </form>
          <a
            href="/"
            className="block text-center text-primary text-sm mt-4 hover:underline"
          >
            ← {t("guideRegister.backHome")}
          </a>
        </div>
      </div>
    );
  }

  // Submitted state
  if (currentStep >= 6) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {t("guideRegister.thankYou")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("guideRegister.pendingReview")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" onClick={() => navigate("/guide-dashboard")}>
              {t("guideRegister.manageDashboard", "Manage Portfolio")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              ← {t("guideRegister.backHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <a href="/">
            <img
              src={logoImg}
              alt="iGuide Tours"
              className="h-8 w-8 rounded-full object-cover"
            />
          </a>
          <h1 className="font-display text-xl font-bold text-foreground">
            {t("guideRegister.title")}
          </h1>
        </div>
        <span className="text-sm text-muted-foreground">{email}</span>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Step indicators */}
        <div className="flex items-center mb-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            const isClickable = true;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={idx} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(idx)}
                        className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                          isDone
                            ? "bg-primary border-primary text-primary-foreground hover:scale-105 hover:shadow-lg shadow-primary/25"
                            : isActive
                            ? "border-primary text-primary bg-primary/10 ring-4 ring-primary/20 shadow-md"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary/60 hover:scale-105 opacity-60 hover:opacity-100"
                        }`}
                        aria-label={`Go to step: ${step.label}`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {isDone ? `✓ ${step.label} — Completed` : isActive ? `${step.label} — Current step` : `${step.label} — Click to jump`}
                    </TooltipContent>
                  </Tooltip>
                  <span
                    className={`text-[11px] font-semibold text-center hidden sm:block leading-tight max-w-[72px] transition-colors cursor-pointer ${
                      isActive ? "text-primary" : isDone ? "text-primary/80 hover:text-primary" : "text-muted-foreground/60 hover:text-primary/60"
                    }`}
                    onClick={() => setCurrentStep(idx)}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 mx-1 sm:mx-2 h-0.5 rounded-full mt-[-20px] sm:mt-[-24px]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx < currentStep ? "bg-primary" : "bg-border"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 mb-6">
          {/* Step 0: Personal Info */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                {t("guideRegister.personalInfo")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t("guideRegister.firstName")} *
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {t("guideRegister.lastName")} *
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("guideRegister.email", "Email")} *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="john@example.com"
                  className={emailError ? "border-destructive" : ""}
                />
                {emailError && (
                  <p className="text-xs text-destructive mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("guideRegister.phone")} *
                </label>
                <Input
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={phoneError ? "border-destructive" : ""}
                />
                {phoneError && (
                  <p className="text-xs text-destructive mt-1">{phoneError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("guideRegister.address", "Address")} *
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
            </div>
          )}

          {/* Step 1: Service Areas */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                {t("guideRegister.serviceAreasTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("guideRegister.serviceAreasDesc")}
              </p>

              {/* Selected chips */}
              {serviceAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area) => (
                    <span key={area} className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      {area}
                      <button type="button" onClick={() => setServiceAreas(serviceAreas.filter((a) => a !== area))} className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input for areas */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("guideRegister.searchArea", "Search country, city, or type your own...")}
                  className="pl-9"
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = areaSearchQuery.trim();
                      if (val && !serviceAreas.includes(val)) {
                        setServiceAreas([...serviceAreas, val]);
                        setAreaSearchQuery("");
                      }
                    }
                  }}
                />
              </div>

              {/* Filterable area list */}
              {(() => {
                const q = areaSearchQuery.toLowerCase();
                const filteredAreas = q
                  ? AREA_OPTIONS.filter((a) => a.toLowerCase().includes(q))
                  : AREA_OPTIONS.filter((a) => a === PILOT_CITY || ["Washington D.C.", "USA", "Canada", "United Kingdom", "France", "Germany", "Italy", "Spain", "Japan", "Australia", "Brazil", "Mexico"].includes(a));
                const showAddCustom = q && !AREA_OPTIONS.some((a) => a.toLowerCase() === q);

                return (
                  <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-1">
                    {filteredAreas.slice(0, 30).map((area) => {
                      const isSel = serviceAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleItem(serviceAreas, setServiceAreas, area)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-primary/5 ${
                            isSel ? "bg-primary/10 text-primary font-medium" : "text-foreground/80"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            {area}
                          </span>
                          {isSel && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      );
                    })}
                    {q && filteredAreas.length > 30 && (
                      <p className="text-xs text-muted-foreground text-center py-2">Keep typing to narrow results…</p>
                    )}
                    {showAddCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          const val = areaSearchQuery.trim();
                          if (val && !serviceAreas.includes(val)) {
                            setServiceAreas([...serviceAreas, val]);
                            setAreaSearchQuery("");
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-foreground mt-1"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>Add "<strong>{areaSearchQuery.trim()}</strong>"</span>
                      </button>
                    )}
                    {filteredAreas.length === 0 && !showAddCustom && (
                      <p className="text-sm text-muted-foreground text-center py-4">Type to search destinations</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Step 2: Languages */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                {t("guideRegister.languagesTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("guideRegister.languagesDesc")}
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const selected = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleItem(languages, setLanguages, lang)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/30"
                      }`}
                    >
                      {translateOption(t, lang)}
                    </button>
                  );
                })}
              </div>

              {/* Other language free-text */}
              <div className="pt-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {t("guideRegister.otherLanguage", "Other language(s)")}
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t("guideRegister.otherLanguagePlaceholder", "e.g. Swahili, Tagalog…")}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !languages.includes(val)) {
                          setLanguages([...languages, val]);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                    id="other-language-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-primary/20"
                    onClick={() => {
                      const input = document.getElementById("other-language-input") as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val && !languages.includes(val)) {
                        setLanguages([...languages, val]);
                        input.value = "";
                      }
                    }}
                  >
                    {t("guideRegister.addLanguage", "Add")}
                  </Button>
                </div>
              </div>

              {/* Show custom (non-preset) languages as removable badges */}
              {languages.filter(l => !LANGUAGE_OPTIONS.includes(l)).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {languages.filter(l => !LANGUAGE_OPTIONS.includes(l)).map(lang => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="gap-1 cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setLanguages(languages.filter(l => l !== lang))}
                    >
                      {lang} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Specialties */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                {t("guideRegister.specialtiesTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("guideRegister.specialtiesDesc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPECIALIZATION_OPTIONS.map((spec) => {
                  const selected = specializations.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() =>
                        toggleItem(specializations, setSpecializations, spec)
                      }
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/30"
                      }`}
                    >
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      {translateOption(t, spec)}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {t("guideRegister.tourTypes")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TOUR_TYPE_OPTIONS.map((tt) => {
                    const selected = tourTypes.includes(tt);
                    return (
                      <button
                        key={tt}
                        type="button"
                        onClick={() => toggleItem(tourTypes, setTourTypes, tt)}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground hover:border-primary/30"
                        }`}
                      >
                         {translateOption(t, tt)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photo & Bio */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                {t("guideRegister.photoBioTitle")}
              </h2>

              {/* Photo upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("guideRegister.profilePhoto")}
                </label>
                <div className="flex items-center gap-4">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/30 transition-colors text-sm text-foreground">
                      <Upload className="w-4 h-4" />
                      {t("guideRegister.uploadPhoto")}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("guideRegister.biography")} *
                </label>
                <Textarea
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder={t("guideRegister.biographyPlaceholder")}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {biography.length}/500 ({t("guideRegister.minChars", { count: 20 })})
                </p>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("guideRegister.summary")}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">{t("guideRegister.firstName")}:</span>
                  <span className="text-foreground">{firstName} {lastName}</span>
                  <span className="text-muted-foreground">{t("guideRegister.serviceAreasTitle")}:</span>
                  <span className="text-foreground">{translateOptions(t, serviceAreas).join(", ") || "—"}</span>
                  <span className="text-muted-foreground">{t("guideRegister.languagesTitle")}:</span>
                  <span className="text-foreground">{translateOptions(t, languages).join(", ")}</span>
                  <span className="text-muted-foreground">{t("guideRegister.specialtiesTitle")}:</span>
                  <span className="text-foreground">
                    {translateOptions(t, specializations).join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Credentials & Insurance */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Credentials & Insurance
              </h2>
              <p className="text-sm text-muted-foreground">
                Provide your licensing and insurance details. These are required for verification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Insurance Company *
                  </label>
                  <Input
                    value={insuranceCompany}
                    onChange={(e) => setInsuranceCompany(e.target.value)}
                    placeholder="e.g. TourGuard Insurance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Insurance Policy Number *
                  </label>
                  <Input
                    value={insurancePolicyNumber}
                    onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                    placeholder="e.g. TG-DC-2026-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    License Number *
                  </label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. DC-LG-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Licensing Authority *
                  </label>
                  <Input
                    value={licensingAuthority}
                    onChange={(e) => setLicensingAuthority(e.target.value)}
                    placeholder="e.g. DC Department of Tourism"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Other Certifications
                </label>
                <Input
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="CPR Certified, First Aid, etc. (comma-separated)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple certifications with commas
                </p>
              </div>

              {/* License document upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  License / Insurance Document Upload
                </label>
                <div className="flex items-center gap-4">
                  {licenseDocName ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span className="truncate max-w-[200px]">{licenseDocName}</span>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-6 rounded-xl bg-muted/50 flex flex-col items-center justify-center border-2 border-dashed border-border">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload supporting document</span>
                    </div>
                  )}
                  <label className="cursor-pointer flex-shrink-0">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/30 transition-colors text-sm text-foreground">
                      <Upload className="w-4 h-4" />
                      {licenseDocName ? "Replace" : "Choose File"}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleLicenseDocChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG, or DOC (max 20MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("guideRegister.back")}
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              {t("guideRegister.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
            >
              {submitting ? (
                <div className="animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {t("guideRegister.submit")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideRegister;

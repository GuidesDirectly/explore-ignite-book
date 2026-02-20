interface PasswordStrengthMeterProps {
  password: string;
}

export interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 10 characters", test: (pw) => pw.length >= 10 },
  { label: "Uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "Number (0–9)", test: (pw) => /[0-9]/.test(pw) },
  { label: "Symbol (!@#$…)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  return PASSWORD_RULES.filter((r) => r.test(password)).length;
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordStrength(password) === PASSWORD_RULES.length;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = [
  "",
  "bg-destructive",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
];
const STRENGTH_TEXT = [
  "",
  "text-destructive",
  "text-orange-500",
  "text-yellow-500",
  "text-blue-500",
  "text-green-500",
];

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-2 mt-1">
      {/* Strength bar */}
      <div className="flex gap-1 h-1.5">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i < strength ? STRENGTH_COLORS[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${STRENGTH_TEXT[strength]}`}>
        {STRENGTH_LABELS[strength]}
      </p>

      {/* Rule checklist */}
      <ul className="space-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`text-xs flex items-center gap-1.5 transition-colors ${
                passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              }`}
            >
              <span className="text-[10px]">{passed ? "✓" : "○"}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;

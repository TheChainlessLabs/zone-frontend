/**
 * Icon system — semantic alias map over Lucide.
 *
 * Lucide is the visual anchor; component code references brand semantics
 * (Icon.Buy, Icon.Settled, Icon.Proof) rather than the underlying Lucide
 * glyph names. When the brand decides a different glyph fits a semantic,
 * swap it once here and every consumer follows.
 *
 * Brand lexicon: see omega-docs/03-brand/naming.md (Match, Settled, Proof,
 * Pending, Cancelled, Failed).
 *
 * Downstream rule: components import `Icon` from `@/lib/icons`, not from
 * `lucide-react` directly. The lint rule that enforces this lands in M7
 * production hardening (omega-interface #118 a11y context).
 */
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowDownLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Sun,
  Wallet,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export const Icon = {
  // Order lifecycle
  Buy: ArrowUpRight,
  Sell: ArrowDownLeft,
  Submit: ShoppingCart,
  Match: CheckCircle2,
  Settled: CheckCircle2,
  Pending: Clock,
  Cancelled: XCircle,
  Failed: AlertCircle,
  Proof: Shield,

  // Wallet + auth
  Wallet,
  Sign: Lock,
  Disconnect: LogOut,
  Unauthorised: Lock,
  Mail,
  ArrowRight,

  // Privacy + status
  Private: Lock,
  Public: Eye,
  Hidden: EyeOff,

  // Direction + change
  Up: ArrowUp,
  Down: ArrowDown,
  External: ExternalLink,

  // UI affordances
  Copy,
  Close: X,
  Menu,
  Search,
  Settings,
  Theme: { Light: Sun, Dark: Moon },
  Notification: Bell,
  Confirm: Check,
  Caret: { Down: ChevronDown, Right: ChevronRight },

  // Help / info
  Help: HelpCircle,
  Info,
  Warning: AlertTriangle,
} as const satisfies Record<string, LucideIcon | Record<string, LucideIcon>>;

export type IconName = keyof typeof Icon;

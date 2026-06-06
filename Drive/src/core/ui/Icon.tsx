import React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  Battery,
  Bell,
  Bluetooth,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Code,
  Compass,
  Copy,
  Disc3,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flag,
  Footprints,
  Gauge,
  Globe,
  Hand,
  HardDrive,
  Heart,
  HelpCircle,
  History,
  Home as HouseIcon,
  Hourglass,
  Info,
  Key,
  Layers,
  LayoutGrid,
  Lightbulb,
  Link,
  List,
  Lock,
  LockOpen,
  LogIn,
  LogOut,
  Map,
  MapPin,
  MapPinOff,
  Menu,
  MessageSquare,
  Mic,
  Minus,
  MonitorSmartphone,
  Moon,
  MoreHorizontal,
  Music,
  Navigation,
  OctagonAlert,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  Power,
  RefreshCw,
  RotateCw,
  Route,
  Save,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  Sun,
  Target,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Upload,
  User,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Wind,
  X,
  Zap,
  ZapOff,
  type LucideIcon,
  type LucideProps,
} from "lucide-react-native";
import { colors } from "@/core/theme";

export type IconName =
  | "home"
  | "settings"
  | "history"
  | "analytics"
  | "run"
  | "drive"
  | "speed"
  | "rotation"
  | "compass"
  | "location_on"
  | "location_off"
  | "power"
  | "play"
  | "pause"
  | "stop"
  | "refresh"
  | "check"
  | "close"
  | "arrow_back"
  | "chevron_right"
  | "chevron_down"
  | "chevron_up"
  | "expand_more"
  | "expand_less"
  | "add"
  | "edit"
  | "delete"
  | "warning"
  | "error"
  | "info"
  | "shield"
  | "shield_check"
  | "bolt"
  | "timer"
  | "flag"
  | "star"
  | "favorite"
  | "save"
  | "share"
  | "bluetooth"
  | "wifi"
  | "wifi_off"
  | "battery"
  | "volume_up"
  | "volume_off"
  | "visibility"
  | "visibility_off"
  | "person"
  | "person_add"
  | "group"
  | "search"
  | "filter"
  | "more"
  | "download"
  | "upload"
  | "link"
  | "copy"
  | "moon"
  | "sun"
  | "bell"
  | "account"
  | "schedule"
  | "calendar"
  | "phone"
  | "phone_iphone"
  | "laptop"
  | "storage"
  | "public"
  | "place"
  | "map"
  | "directions"
  | "explore"
  | "music"
  | "mic"
  | "camera"
  | "image"
  | "flash"
  | "flash_on"
  | "flash_off"
  | "lightbulb"
  | "key"
  | "lock"
  | "lock_open"
  | "logout"
  | "login"
  | "help"
  | "feedback"
  | "bug"
  | "code"
  | "tune"
  | "menu"
  | "apps"
  | "grid_view"
  | "list"
  | "layers"
  | "palette"
  | "trending_up"
  | "trending_down"
  | "trending_flat"
  | "timeline"
  | "hourglass"
  | "handling"
  | "device"
  | "gauge"
  | "steering"
  | "brake"
  | "accel"
  | "route"
  | "sparkles"
  | "target"
  | "wind";

const ICONS: Record<IconName, LucideIcon> = {
  home: HouseIcon,
  settings: Settings,
  history: History,
  analytics: BarChart3,
  run: Footprints,
  drive: Truck,
  speed: Gauge,
  rotation: RotateCw,
  compass: Compass,
  location_on: MapPin,
  location_off: MapPinOff,
  power: Power,
  play: Play,
  pause: Pause,
  stop: Square,
  refresh: RefreshCw,
  check: Check,
  close: X,
  arrow_back: ArrowLeft,
  chevron_right: ChevronRight,
  chevron_down: ChevronDown,
  chevron_up: ChevronUp,
  expand_more: ChevronDown,
  expand_less: ChevronUp,
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  warning: AlertTriangle,
  error: OctagonAlert,
  info: Info,
  shield: Shield,
  shield_check: ShieldCheck,
  bolt: Zap,
  timer: Timer,
  flag: Flag,
  star: Star,
  favorite: Heart,
  save: Save,
  share: Share2,
  bluetooth: Bluetooth,
  wifi: Wifi,
  wifi_off: WifiOff,
  battery: Battery,
  volume_up: Volume2,
  volume_off: VolumeX,
  visibility: Eye,
  visibility_off: EyeOff,
  person: User,
  person_add: UserPlus,
  group: Users,
  search: Search,
  filter: Filter,
  more: MoreHorizontal,
  download: Download,
  upload: Upload,
  link: Link,
  copy: Copy,
  moon: Moon,
  sun: Sun,
  bell: Bell,
  account: UserPlus,
  schedule: Clock,
  calendar: Calendar,
  phone: Phone,
  phone_iphone: Smartphone,
  laptop: MonitorSmartphone,
  storage: HardDrive,
  public: Globe,
  place: MapPin,
  map: Map,
  directions: Navigation,
  explore: Compass,
  music: Music,
  mic: Mic,
  camera: Camera,
  image: FileText,
  flash: Zap,
  flash_on: Zap,
  flash_off: ZapOff,
  lightbulb: Lightbulb,
  key: Key,
  lock: Lock,
  lock_open: LockOpen,
  logout: LogOut,
  login: LogIn,
  help: HelpCircle,
  feedback: MessageSquare,
  bug: Disc3,
  code: Code,
  tune: SlidersHorizontal,
  menu: Menu,
  apps: LayoutGrid,
  grid_view: LayoutGrid,
  list: List,
  layers: Layers,
  palette: Sparkles,
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  trending_flat: Minus,
  timeline: ArrowUpDown,
  hourglass: Hourglass,
  handling: Hand,
  device: Smartphone,
  gauge: Gauge,
  steering: Compass,
  brake: Square,
  accel: Gauge,
  route: Route,
  sparkles: Sparkles,
  target: Target,
  wind: Wind,
};

export type IconProps = LucideProps & {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({
  name,
  size = 24,
  color = colors.ink.primary,
  ...rest
}: IconProps) {
  const C = ICONS[name];
  if (!C) return null;
  return <C size={size} color={color} strokeWidth={1.8} {...rest} />;
}

export const _styles = Text;

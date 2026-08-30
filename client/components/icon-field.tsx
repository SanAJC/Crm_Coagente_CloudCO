import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CreditCard,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Package,
  PhoneCall,
  Send,
  ShoppingCart,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type FloatingIcon = {
  icon: LucideIcon;
  top: string;
  left: string;
  wash: string;
  rotate: string;
  size: "sm" | "md" | "lg";
  opacity: string;
};

const floatingIcons: FloatingIcon[] = [
  { icon: Send, top: "6%", left: "9%", wash: "bg-powder-blue", rotate: "-rotate-6", size: "lg", opacity: "opacity-[0.22]" },
  { icon: Instagram, top: "10%", left: "23%", wash: "bg-peach-wash", rotate: "rotate-12", size: "sm", opacity: "opacity-[0.16]" },
  { icon: Bot, top: "4%", left: "38%", wash: "bg-lavender-wash", rotate: "rotate-3", size: "md", opacity: "opacity-[0.2]" },
  { icon: Facebook, top: "12%", left: "52%", wash: "bg-violet-wash", rotate: "-rotate-12", size: "sm", opacity: "opacity-[0.18]" },
  { icon: MessageCircle, top: "5%", left: "66%", wash: "bg-mint-wash", rotate: "rotate-6", size: "lg", opacity: "opacity-[0.2]" },
  { icon: Workflow, top: "9%", left: "80%", wash: "bg-solar-wash", rotate: "-rotate-3", size: "md", opacity: "opacity-[0.18]" },
  { icon: CreditCard, top: "4%", left: "93%", wash: "bg-aqua-wash", rotate: "rotate-12", size: "sm", opacity: "opacity-[0.2]" },

  { icon: Package, top: "26%", left: "4%", wash: "bg-mint-wash", rotate: "rotate-6", size: "sm", opacity: "opacity-[0.16]" },
  { icon: BarChart3, top: "30%", left: "17%", wash: "bg-solar-wash", rotate: "-rotate-6", size: "lg", opacity: "opacity-[0.2]" },
  { icon: Bell, top: "24%", left: "84%", wash: "bg-lavender-wash", rotate: "rotate-12", size: "md", opacity: "opacity-[0.18]" },
  { icon: ShoppingCart, top: "31%", left: "95%", wash: "bg-peach-wash", rotate: "-rotate-6", size: "sm", opacity: "opacity-[0.2]" },

  { icon: Mail, top: "46%", left: "8%", wash: "bg-powder-blue", rotate: "rotate-3", size: "md", opacity: "opacity-[0.2]" },
  { icon: Users, top: "52%", left: "22%", wash: "bg-violet-wash", rotate: "-rotate-12", size: "sm", opacity: "opacity-[0.16]" },
  { icon: PhoneCall, top: "48%", left: "90%", wash: "bg-mint-wash", rotate: "rotate-6", size: "lg", opacity: "opacity-[0.2]" },
  { icon: CalendarDays, top: "55%", left: "76%", wash: "bg-solar-wash", rotate: "-rotate-3", size: "sm", opacity: "opacity-[0.18]" },

  { icon: Instagram, top: "66%", left: "5%", wash: "bg-aqua-wash", rotate: "rotate-6", size: "md", opacity: "opacity-[0.18]" },
  { icon: Send, top: "72%", left: "18%", wash: "bg-lavender-wash", rotate: "-rotate-6", size: "sm", opacity: "opacity-[0.2]" },
  { icon: Workflow, top: "68%", left: "88%", wash: "bg-peach-wash", rotate: "rotate-3", size: "md", opacity: "opacity-[0.18]" },
  { icon: Bot, top: "76%", left: "97%", wash: "bg-powder-blue", rotate: "-rotate-12", size: "sm", opacity: "opacity-[0.16]" },

  { icon: Package, top: "88%", left: "10%", wash: "bg-solar-wash", rotate: "rotate-12", size: "sm", opacity: "opacity-[0.2]" },
  { icon: Facebook, top: "92%", left: "24%", wash: "bg-mint-wash", rotate: "-rotate-6", size: "lg", opacity: "opacity-[0.18]" },
  { icon: MessageCircle, top: "86%", left: "40%", wash: "bg-violet-wash", rotate: "rotate-6", size: "sm", opacity: "opacity-[0.2]" },
  { icon: BarChart3, top: "94%", left: "58%", wash: "bg-peach-wash", rotate: "-rotate-3", size: "md", opacity: "opacity-[0.16]" },
  { icon: Bell, top: "89%", left: "72%", wash: "bg-aqua-wash", rotate: "rotate-12", size: "sm", opacity: "opacity-[0.2]" },
  { icon: CreditCard, top: "93%", left: "86%", wash: "bg-lavender-wash", rotate: "-rotate-6", size: "md", opacity: "opacity-[0.18]" },
  { icon: Users, top: "87%", left: "96%", wash: "bg-solar-wash", rotate: "rotate-3", size: "sm", opacity: "opacity-[0.2]" },

  { icon: ShoppingCart, top: "40%", left: "48%", wash: "bg-powder-blue", rotate: "rotate-6", size: "sm", opacity: "opacity-[0.14]" },
  { icon: CalendarDays, top: "62%", left: "50%", wash: "bg-mint-wash", rotate: "-rotate-6", size: "sm", opacity: "opacity-[0.14]" },
];

export function IconField({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
      aria-hidden
    >
      {floatingIcons.map(({ icon: Icon, top, left, wash, rotate, size, opacity }, index) => (
        <span
          key={index}
          style={{ top, left }}
          className={cn(
            "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl",
            wash,
            rotate,
            opacity,
            size === "lg" ? "size-16" : size === "md" ? "size-12" : "size-9",
          )}
        >
          <Icon
            className={cn(
              "text-ink",
              size === "lg" ? "size-7" : size === "md" ? "size-5" : "size-4",
            )}
          />
        </span>
      ))}
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  AlertCircle,
  CalendarCheck,
  BrainCog,
  KanbanSquare,
  FileText,
  Plug,
  Settings,
  BookOpen,
  HelpCircle
} from "lucide-react";

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Incidents", href: "/incidents", icon: <AlertCircle className="w-5 h-5" /> },
  { label: "Sanity Scheduler", href: "/scheduler", icon: <CalendarCheck className="w-5 h-5" /> },
  { label: "RCA Console", href: "/rca", icon: <BrainCog className="w-5 h-5" /> },
  { label: "Sprint Board", href: "/sprint-board", icon: <KanbanSquare className="w-5 h-5" /> },
  { label: "Audit Trail", href: "/audit-trail", icon: <FileText className="w-5 h-5" /> },
];

const bottomNav = [
  { label: "Integrations", href: "/integrations", icon: <Plug className="w-5 h-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
  { label: "Documentation", href: "/docs", icon: <BookOpen className="w-5 h-5" /> },
  { label: "Help", href: "/help", icon: <HelpCircle className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r shadow-sm justify-between py-6 px-4">
      {/* Main nav */}
      <nav className="flex flex-col gap-2">
        {mainNav.map((item) => {
          const selected = pathname && pathname.startsWith(item.href);
          return (
            <Link key={item.label} href={item.href} legacyBehavior passHref>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-gray-700
                  ${selected ? "bg-purple-200 text-purple-800 shadow-sm" : "hover:bg-purple-100 hover:text-purple-700"}
                `}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {item.icon}
                <span>{item.label}</span>
                {selected && (
                  <motion.div
                    layoutId="sidebar-active-tab"
                    className="absolute inset-0 rounded-lg bg-purple-300/30 z-[-1]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.a>
            </Link>
          );
        })}
      </nav>
      {/* Divider */}
      <div className="my-4 border-t border-gray-200" />
      {/* Bottom nav */}
      <nav className="flex flex-col gap-2 text-sm">
        {bottomNav.map((item) => {
          const selected = pathname && pathname.startsWith(item.href);
          return (
            <Link key={item.label} href={item.href} legacyBehavior passHref>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium
                  ${selected ? "bg-purple-100 text-purple-800 shadow-sm" : "hover:bg-purple-50 hover:text-purple-700 text-gray-500"}
                `}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {item.icon}
                <span>{item.label}</span>
                {selected && (
                  <motion.div
                    layoutId="sidebar-active-bottom-tab"
                    className="absolute inset-0 rounded-lg bg-purple-200/40 z-[-1]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 
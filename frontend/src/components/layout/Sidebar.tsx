"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { label: "Sanity Scheduler", href: "/sanity-scheduler", icon: <CalendarCheck className="w-5 h-5" /> },
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
        {mainNav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              pathname && pathname.startsWith(item.href) ? "bg-blue-100 text-blue-700" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Divider */}
      <div className="my-4 border-t border-gray-200" />
      {/* Bottom nav */}
      <nav className="flex flex-col gap-2 text-sm">
        {bottomNav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 hover:text-blue-600 ${
              pathname && pathname.startsWith(item.href) ? "bg-blue-50 text-blue-700" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 
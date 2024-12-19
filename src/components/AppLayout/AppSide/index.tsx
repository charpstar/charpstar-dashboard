"use client";

import { ListItem } from "./components";
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  LogOut, 
  Sun, 
  Moon,
  Box,
  Boxes,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Logo from "@/components/Logo";
import { useQueryClient } from "@tanstack/react-query";
import { useDateRange } from "@/contexts/DateRangeContext";
import { buildDateRange } from "@/utils/uiUtils";

export default function AppSide() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { setDateRange } = useDateRange();

  const handleSignOut = async () => {
    // Reset date range to default
    setDateRange(buildDateRange());
    
    // Clear all queries from the cache
    queryClient.clear();
    
    // Remove all query subscriptions
    queryClient.removeQueries();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Navigate to login page
    router.push("/login");
  };

  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r"
      aria-label="Sidenav"
    >
      {/* Header */}
      <div className="p-4 mb-4 border-b">
        <Logo />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3">
        <nav className="space-y-6">
          {/* Analytics Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Analytics (BETA)
            </div>
            <div className="space-y-1">
              <ListItem
                icon={<LayoutDashboard className="h-4 w-4" />}
                title="Overview"
                href="/"
              />
              <ListItem
                icon={<BarChart3 className="h-4 w-4" />}
                title="Detailed Stats"
                href="/cvr"
              />
            </div>
          </div>

          {/* 3D Service Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              3D Service (BETA)
            </div>
            <div className="space-y-1">
              <ListItem
                icon={<Box className="h-4 w-4" />}
                title="Rendering"
                href="/render"
              />
              <ListItem
                icon={<Boxes className="h-4 w-4" />}
                title="Product Status Control"
                href="/product-status"
              />
            </div>
          </div>

          {/* Support Section */}
          <div>
            <div className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Support (NYI)
            </div>
            <div className="space-y-1">
              <ListItem
                icon={<FileText className="h-4 w-4" />}
                title="Documentation"
                href="/docs"
              />
            </div>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background/95">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start mb-2"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 mr-2" />
          ) : (
            <Sun className="h-4 w-4 mr-2" />
          )}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </Button>
        <Separator className="my-2" />
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground" 
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </aside>
  );
}
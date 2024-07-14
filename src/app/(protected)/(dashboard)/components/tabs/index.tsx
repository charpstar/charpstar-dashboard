import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./overview-tab";

export default function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>

        <TabsTrigger value="analytics" disabled>
          Analytics
        </TabsTrigger>

        <TabsTrigger value="reports" disabled>
          Reports
        </TabsTrigger>

        <TabsTrigger value="notifications" disabled>
          Notifications
        </TabsTrigger>
      </TabsList>

      <OverviewTab />
    </Tabs>
  );
}

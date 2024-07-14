import Cards from "./cards";
import { Overview } from "./overview";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Cards />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>

            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>

              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

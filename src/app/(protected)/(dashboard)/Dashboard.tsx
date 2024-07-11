import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MainNav } from "./components/main-nav";
import { CalendarDateRangePicker } from "./components/date-range-picker";
import { Overview } from "./components/overview";
import TeamSwitcher from "./components/team-switcher";
import { UserNav } from "./components/user-nav";
import Cards from "./components/cards";

export default function DashboardPage() {
  return (
    <>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <TeamSwitcher />

            <MainNav className="mx-6" />

            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Dashboard - Client name
            </h2>

            <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              {/* <Button>Download</Button> */}
            </div>
          </div>

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

                    <CardDescription>
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

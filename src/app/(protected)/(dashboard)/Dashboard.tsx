import { MainNav } from "./components/main-nav";
import { CalendarDateRangePicker } from "./components/date-range-picker";
import TeamSwitcher from "./components/team-switcher";
import { UserNav } from "./components/user-nav";
import Tabs from "./components/tabs";

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

          <Tabs />
        </div>
      </div>
    </>
  );
}

import QueryClientProviderCC from "./QueryProvider";
import UserProviderSC from "@/contexts/UserProviderSC";

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProviderCC>
      <UserProviderSC>{children}</UserProviderSC>
    </QueryClientProviderCC>
  );
}

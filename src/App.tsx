import { Tabs } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { CookieBanner } from "@/components/CookieBanner";
import { Sidebar } from "@/components/sidebar";
import { QueryTabs } from "@/components/QueryTabs";
import { useActiveTab } from "./store/queries";
import { QueryViews } from "./components/QueryViews";
import { StoreProvider } from "./store";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DuckDBProviderWithSuspense } from "./db";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizablePanelSeparator,
} from "@/components/ui/resizable";

function AppContent() {
  const [activeTab, setActiveTab] = useActiveTab();

  return (
    <div className="h-screen bg-background text-foreground">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="16em" minSize="12em" maxSize="32em">
          <Sidebar />
        </ResizablePanel>
        <ResizablePanelSeparator />
        <ResizablePanel minSize="20em">
          <main className="flex flex-col overflow-hidden bg-background h-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col h-full gap-0"
            >
              <QueryTabs />
              <div className="flex-1 overflow-auto">
                <QueryViews />
              </div>
            </Tabs>
            <WelcomeDialog />
            <CookieBanner />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DuckDBProviderWithSuspense>
        <StoreProvider>
          <AppContent />
        </StoreProvider>
      </DuckDBProviderWithSuspense>
    </ThemeProvider>
  );
}

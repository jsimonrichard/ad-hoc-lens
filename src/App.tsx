import { Tabs } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { Sidebar } from "@/components/sidebar";
import { QueryTabs } from "@/components/QueryTabs";
import { useActiveTab } from "./store/queries";
import { QueryEditors } from "./components/QueryEditors";
import { StoreProvider } from "./store";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DuckDBProviderWithSuspense } from "./db";

function AppContent() {
  const [activeTab, setActiveTab] = useActiveTab();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full gap-0"
        >
          <QueryTabs />
          <div className="flex-1 overflow-auto">
            <QueryEditors />
          </div>
        </Tabs>
        <WelcomeDialog />
      </main>
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

import type { Component } from "solid-js";
import { Tabs } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { Sidebar } from "@/components/sidebar";
import { QueryTabs } from "@/components/QueryTabs";
import { useActiveTab } from "./store/queries";
import QueryEditors from "./components/QueryEditors";
import { StoreProvider } from "./store";

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

const AppContent: Component = () => {
  const [activeTab, setActiveTab] = useActiveTab();

  return (
    <div class="flex h-screen bg-background text-foreground">
      <Sidebar />

      <main class="flex-1 flex flex-col overflow-auto bg-background">
        <Tabs value={activeTab()} onChange={setActiveTab}>
          <QueryTabs />
          <QueryEditors />
        </Tabs>
        <WelcomeDialog />
      </main>
    </div>
  );
};

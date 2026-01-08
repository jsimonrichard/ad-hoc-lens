import { ThemeSwitcher } from "./ThemeSwitcher";

export function SidebarActionsSection() {
  return (
    <div className="border-t-2 border-accent pt-2 mt-auto">
      <div className="space-y-1">
        <ThemeSwitcher />
      </div>
    </div>
  );
}


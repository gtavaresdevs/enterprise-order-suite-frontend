import { AvatarDropdown } from "./AvatarDropdown";
import { NotificationBell } from "./NotificationBell";

export function GlobalHeader() {
  return (
    <header className="hidden lg:flex items-center justify-end h-16 px-6 bg-transparent">
      <div className="flex items-center gap-3">
        <NotificationBell />

        <AvatarDropdown />
      </div>
    </header>
  );
}

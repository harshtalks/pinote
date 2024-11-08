import { ToggleTheme } from "./theme-switcher";

export const Header = () => {
  return (
    <header className="px-12 py-4 mx-auto">
      <div className="flex items-center justify-end">
        <ToggleTheme />
      </div>
    </header>
  );
};

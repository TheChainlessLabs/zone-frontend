import Navbar from "@/components/Navbar";
import SettingsPage from "@/components/SettingsPage";

export default function SettingsRoute() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-4 md:gap-6">
        <h1 className="text-h2 font-semibold">Settings</h1>
        <SettingsPage />
      </div>
    </div>
  );
}

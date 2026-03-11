import Navbar from "@/components/Navbar";
import SettingsPage from "@/components/SettingsPage";

export default function SettingsRoute() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <h1 className="text-h2 font-semibold">Settings</h1>
        <SettingsPage />
      </div>
    </div>
  );
}

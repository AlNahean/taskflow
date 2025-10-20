import { SettingsPageContent } from "@/components/pages/settings-page"

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default function SettingsPage() {
  return <SettingsPageContent />
}

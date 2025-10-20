import { NotificationsPageContent } from "../../components/pages/notifications-page"

// Disable caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default function NotificationsPage() {
    return <NotificationsPageContent />
}

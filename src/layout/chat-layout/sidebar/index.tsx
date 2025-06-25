import useDeviceSize from "@/hooks/useDeviceSize"
import MobileSidebar from "./mobile-sidebar"
import DesktopSidebar from "./desktop-sidebar"

export default function Sidebar() {
  const { isMobile } = useDeviceSize()
  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
}
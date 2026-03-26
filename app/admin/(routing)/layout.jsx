import { requireAdmin } from "@/lib/requireAdmin";
import LeftSidebar from "../UI/Navbar/LeftSideBar";
import ContentWrapper from "../ContentWrapper";


export default async function CheckLayout({ children }) {
  const adminToken = await requireAdmin();

  return (
            <div className="bg-gray-50">
              {/* LEFT SIDEBAR */}
              <ContentWrapper adminToken={adminToken}>

              <LeftSidebar />

              {/* RIGHT CONTENT AREA */}
                    <main className="flex-1 p-0">
                      {children}
                    </main>
              </ContentWrapper>
              
            </div>
  );
}

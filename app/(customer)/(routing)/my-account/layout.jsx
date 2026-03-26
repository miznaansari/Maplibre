import { cookies } from "next/headers";
import MyAccountHeader from "../../customer/components/MyAccount/MyAccountHeader";
import AccountSidebar from "../../customer/components/MyAccount/AccountSidebar";
import MyAccountPage from "../../customer/components/MyAccount/MyAccountPage";
import { requireUser } from "@/lib/requireUser";


export const metadata = {
    title: "My Account",
};

export default async function MyAccountLayout({ children }) {
    // ✅ MUST await
    const cookieStore = await cookies();

    // ✅ NOW .get() works
    const authToken = cookieStore.get("authToken")?.value;
    const verifyToken = await requireUser();

    // ❌ NOT LOGGED IN
    if (!verifyToken) {
        return (
            <>
                {/* <MyAccountHeader /> */}
                <MyAccountPage />
            </>
        );
    }

    // ✅ LOGGED IN
    return (
        <>
            {/* <MyAccountHeader /> */}

            <div className="min-h-screen ">
                <div className="mx-auto flex max-w-7xl gap-6 px-2 md:px-6 py-2 md:py-4">
                    {/* <AccountSidebar /> */}


                    <main className="flex-1 rounded ">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

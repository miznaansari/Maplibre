import MyAccountPage from "@/app/(customer)/customer/components/MyAccount/MyAccountPage";
import { requireUser } from "@/lib/requireUser";

export default async function LoginPage() {
  const isLoggedIn = await requireUser();

  return (
     <MyAccountPage isLoggedIn={isLoggedIn} />
   
  );
}

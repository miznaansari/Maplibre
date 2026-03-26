import { requireAdmin } from "@/lib/requireAdmin";
import AddAdmin from "./AddAdmin";

export default async function AdminsPage() {
  await requireAdmin(); // 🔐 PAGE-LEVEL PROTECTION

  return (
    

      <AddAdmin />
  );
}

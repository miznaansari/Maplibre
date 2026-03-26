import ProductTopBar from "../ProductSideBar";

export const metadata = {
  title: "Products | Admin",
};

export default async function ProductLayout({ children }) {
  return (
    <div className="min-h-screen ">
      
      {/* 🔹 TOP BAR */}
      <div className=" ">
        <ProductTopBar />
      </div>

      {/* 🔹 PAGE CONTENT */}
      <main className="mx-auto  px-2 ">
        {children}
      </main>
    </div>
  );
}

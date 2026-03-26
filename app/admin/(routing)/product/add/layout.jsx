import AddProductTop from "../AddProductTop";
import ProductTopBar from "../ProductSideBar";

export const metadata = {
  title: "Products | Admin",
};

export default async function ProductLayout({ children }) {
  return (
    <div className=" ml-2 mt-2">
      
      {/* 🔹 TOP BAR */}
      {/* <div className="">
        <AddProductTop />
      </div> */}

      {/* 🔹 PAGE CONTENT */}
      <main className=" ">
        {children}
      </main>
    </div>
  );
}

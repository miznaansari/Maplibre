// "use client";

// import dynamic from "next/dynamic";
// import MapSwitch from "../../MapSwitch";

// // 🚨 Disable SSR
// const MapComponent = dynamic(() => import("./MapComponent"), {
//   ssr: false,
// });

// export default function Page() {
//   return (
//     <div className="h-screen w-full">
//       <MapSwitch />
//       <MapComponent />
//     </div>
//   );
// }
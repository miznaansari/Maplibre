"use client";

import dynamic from "next/dynamic";
import Maplibre from "./Maplibre";
import MapSwitch from "../../MapSwitch";



export default function Page() {
  return (
    <div className="h-screen w-full">
      {/* <MapComponent /> */}
            <MapSwitch />
      
      <Maplibre />
    </div>
  );
}
"use client";

import dynamic from "next/dynamic";
import MapSwitch from "../../MapSwitch";
import Maplibre from "./Maplibre";



export default function Page() {
  return (
    <div className="h-screen w-full">
      {/* <MapComponent /> */}
            <MapSwitch />
            <Maplibre />
      
    </div>
  );
}
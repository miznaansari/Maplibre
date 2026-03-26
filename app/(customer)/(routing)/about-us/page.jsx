import AboutPage from "../../customer/components/Aboutus/About";
import LetsWorkTogether from "../../customer/components/Aboutus/LetsWorkTogether";
import PartnersAndBrands from "../../customer/components/Aboutus/PartnersAndBrands";
import WhatWeDo from "../../customer/components/Aboutus/WhatWeDo";
import FAQAccordion from "../../customer/components/home/FAQAccordion";
import ServiceHighlights from "../../customer/components/home/ServiceHighlights";

export const metadata = {
    title: "About Us | Samad Agency",
    description: "Samad Agency Website-meta",
};

export default function Page() {
  return (
    <>
      <AboutPage />
      <LetsWorkTogether />
      <FAQAccordion />
        <ServiceHighlights/>

  
    </>
  );
}

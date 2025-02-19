import PharmacyNav from "@/components/navigation/PharmacyNav";
import "../globals.css";
export default function PharmacyLayout({ children }) {
    return (
        
      <div className="pharmacy-layout">
        <PharmacyNav/>
        <div className="ml-72 mt-4">{children}</div>
        
      </div>
    )
  }
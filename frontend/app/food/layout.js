import FoodNav from "@/components/navigation/FoodNav";
import "../globals.css";
export default function FoodLayout({ children }) {
    return (
        
      <div className="food-layout">
        <FoodNav/>
        <div className="ml-72 mt-4">{children}</div>
        
      </div>
    )
  }
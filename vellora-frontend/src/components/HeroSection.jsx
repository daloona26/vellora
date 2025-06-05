import { Link } from "react-router-dom";
import herogirl from "../assets/hero-girl.png";

const HeroSection = () => {
  return (
    <section className="relative h-[400px] flex items-center overflow-hidden bg-[#e0f2f1]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#e0f2f1] via-[#e0f2f1] to-transparent z-10"></div>

      <img
        src={herogirl} 
        alt="Young woman wearing a beige jacket"
        className="absolute right-0 bottom-0 h-full object-cover z-0"
        style={{ width: "auto", maxHeight: "100%" }}
      />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="text-left">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight">
            Latest Arrivals
          </h1>
          <Link to="/products">
            <button className="mt-6 cursor-pointer bg-white text-gray-800 py-3 px-8 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors duration-300 shadow-md font-sans">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

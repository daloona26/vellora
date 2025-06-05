import HeroSection from "../components/HeroSection";
import CategorySection from "../components/CategorySection";
import FeaturedProducts from "../components/FeaturedProducts";

const Home = () => {
  return (
    <div className="bg-white text-gray-900 font-body">
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
    </div>
  );
};

export default Home;

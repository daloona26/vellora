import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import AllCategories from "./pages/AllCategories";
import CategoryProductsPage from "./pages/Products";
import AllProductsPage from "./pages/AllProductsPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import Signup from "./pages/Signup";
import { AuthProvider } from "./context/AuthContext";
import UserPage from "./pages/UserPage";
import CheckoutPage from "./pages/CheckoutPage";
import Policy from "./components/Policy";
import Aboutus from "./components/Aboutus";


function App() {
  return (
    <>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryProductsPage />}
          />
          <Route path="/products" element={<AllProductsPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<Signup />} />
          <Route path="/profile" element={<UserPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/about-us" element={<Aboutus />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;

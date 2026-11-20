import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import UserHome from "./Pages/Home";
import Product from "./Pages/Product";
import Productdetails from "./Pages/Productdetails";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import Adminlayout from "./component/Admin/Adminlayout";
import { useAuth } from "./Context/authcontext";
import Adminproduct from "./Pages/AdminProduct/Adminproduct";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import AdminUsers from "./Pages/Admin/AdminUsers";
import Category from "./Pages/Admin/Category";
import Cart from "./Pages/Cart/Cart";
import Favorites from "./Pages/Favorites";
import CommonToast from "./component/Common/Toast";
import Checkout from "./Pages/Checkout/Checkout";
import MyOrders from "./Pages/MyOrders/MyOrders";
import OrderDetails from "./Pages/OrderDetails/OrderDetails";
import OrderTracking from "./Pages/OrderTracking/OrderTracking";
import AdminOrders from "./Pages/Admin/AdminOrders";
import AdminOrderDetails from "./Pages/Admin/AdminOrderDetails";
import AdminUserProfile from "./Pages/Admin/AdminUserProfile";
import ScrollToTop from "./component/ScrollToTop";
import Payment from "./Pages/Payment";

import Header from "./component/Header";
import Footer from "./component/Footer";
import AuthRoute from "./component/Authroute";

//  import { Contact } from "lucide-react";

const App = () => {
  const { currentUser, loading } = useAuth();
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CommonToast />

      {currentUser?.role !== "admin" && <Header />}
      <Routes>
        <Route path="/" element={<AuthRoute type="public"><UserHome /></AuthRoute>}/>

        <Route
          path="/register"
          element={
            <AuthRoute type="guest">
              <Register />
            </AuthRoute>
          }
        />

        <Route
          path="/login"
          element={
            <AuthRoute type="guest">
              <Login />
            </AuthRoute>
          }
        />

        <Route
          path="/userdashboard"
          element={
            <AuthRoute type="protected" role="user">
              <UserDashboard />
            </AuthRoute>
          }
        />

        <Route
          path="/admindashboard"
          element={
            <AuthRoute type="protected" role="admin">
              <Adminlayout>
                <AdminDashboard />
              </Adminlayout>
            </AuthRoute>
          }
        />

        <Route
          path="*"
          element={
            <AuthRoute type="guest">
              <Login />
            </AuthRoute>
          }
        />

        <Route path="/product" element={<Product />} />

        <Route
          path="/product/category/:category"
          element={
            <AuthRoute type="protected" role="user">
              <Productdetails />
            </AuthRoute>
          }
        />

        <Route
          path="/product/:id"
          element={
            <AuthRoute
              type="protected"
              role="user"
              loginMessage="please Login to view product details."
            >
              <Productdetails />
            </AuthRoute>
          }
        />

        <Route
          path="/admin/product"
          element={
            <AuthRoute type="protected" role="admin">
              <Adminlayout>
                <Adminproduct />
              </Adminlayout>
            </AuthRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AuthRoute type="protected" role="admin">
              {" "}
              <Adminlayout>
                {" "}
                <Category />
              </Adminlayout>
            </AuthRoute>
          }
        />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route
          path="/cart"
          element={
            loading ? null : currentUser?.role === "user" ? (
              <Cart />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/favorites"
          element={
            loading ? null : currentUser?.role === "user" ? (
              <Favorites />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin/users"
          element={
            <AuthRoute type="protected" role="admin">
              <Adminlayout>
                <AdminUsers />
              </Adminlayout>
            </AuthRoute>
          }
        />

        <Route
          path="/admin/users/:id"
          element={
            <AuthRoute type="protected" role="admin">
              <Adminlayout>
                <AdminUserProfile />
              </Adminlayout>
            </AuthRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <AuthRoute type="protected" role="user">
              <Checkout />
            </AuthRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <AuthRoute type="protected" role="user">
              <MyOrders />
            </AuthRoute>
          }
        />

        <Route
          path="/order-details/:id"
          element={
            <AuthRoute type="protected" role="user">
              <OrderDetails />
            </AuthRoute>
          }
        />

        <Route
          path="/order-tracking/:id"
          element={
            <AuthRoute type="protected" role="user">
              <OrderTracking />
            </AuthRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AuthRoute type="protected" role="admin">
              <Adminlayout>
                <AdminOrders />
              </Adminlayout>
            </AuthRoute>
          }
        />

        <Route
          path="/admin/orders/:id"
          element={
            <AuthRoute type="protected" role="admin">
              <Adminlayout>
                <AdminOrderDetails />
              </Adminlayout>
            </AuthRoute>
          }
        />

          <Route
  path="/payment"
  element={
    <AuthRoute type="protected" role="user">
      <Payment />
    </AuthRoute>
  }
/>

        <Route path="/wishlist" element={<Favorites />} />
      </Routes>

      {currentUser?.role !== "admin" && <Footer />}
      {/* <ToastContainer position="top-right" autoClose={3000} newestOnTop  closeOnClick pauseOnHover theme="light" limit={3}/> */}
    </BrowserRouter>
  );
};
export default App;

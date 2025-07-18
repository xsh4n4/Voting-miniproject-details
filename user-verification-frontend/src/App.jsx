import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Verification from "./components/Verification";
import Logout from "./components/Auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Progress from "./components/Progress";

const App = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div>
      <ToastContainer />
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 ${isLogin ? "" : "md:ml-64"}`}>
          <Routes>
            <Route
              path="/"
              element={
                <Progress />
              }
            />

            <Route
              path="/verification"
              element={
                <Verification />
              }
            />

            <Route
              path="/admin"
              element={
                <Home />
              }
            />

            {/* <Route path="/login" element={<Logout />} /> */}
            <Route path="/login" element={<div className="min-h-screen flex items-center justify-center px-4"><Logout /></div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;

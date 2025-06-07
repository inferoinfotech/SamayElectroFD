import { Navigate, Outlet } from "react-router-dom";

const AuthenticatedRoute = () => {
    const token = sessionStorage.getItem("token");
 
    return token ? <Navigate to="/admin" replace /> : <Outlet />;
};

export default AuthenticatedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { toast } from "@/components/ui/toast";
export default function PublicRoute() {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
        toast.add({title: 'Bạn đã đăng nhập, đang quay về trang chủ'})
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

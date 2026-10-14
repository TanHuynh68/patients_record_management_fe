
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-8xl font-bold">404</h1>

      <h2 className="text-2xl font-semibold">
        Không tìm thấy trang
      </h2>

      <p className="text-muted-foreground">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị thay đổi.
      </p>

      <Button>
        <Link to="/">Quay về trang chủ</Link>
      </Button>
    </div>
  );
}

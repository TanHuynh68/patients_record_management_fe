import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { env } from "@/config/env.config"
import axios from "axios"
import { toast } from "@/components/ui/toast"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const email = formData.get("email")?.toString().trim() ?? ""
    const password = formData.get("password")?.toString() ?? ""

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      toast.add({ title: "Vui lòng nhập email" })
      return
    }

    if (!emailRegex.test(email)) {
      toast.add({ title: "Email không đúng định dạng" })
      return
    }

    if (!password) {
      toast.add({ title: "Vui lòng nhập mật khẩu" })
      return
    }

    try {
      const res = await axios.post(`${env.BE_URL}/auth/login`, {
        email,
        password,
      })

      if (res.data.accessToken) {
        toast.add({
          title: res.data.message || "Đăng nhập thành công",
        })
        localStorage.setItem("accessToken", res.data.accessToken)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        navigate('/')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.add({
          title:
            error.response?.data?.message ||
            "Email hoặc mật khẩu không chính xác",
        })
      } else {
        toast.add({ title: "Đã xảy ra lỗi, vui lòng thử lại" })
      }

      console.error("Lỗi đăng nhập:", error)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleLogin}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập tài khoản</h1>

          <p className="text-sm text-balance text-muted-foreground">
            Nhập email và mật khẩu để đăng nhập vào hệ thống
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@gmail.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>

            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Field>
          <Button type="submit" className="w-full">
            Đăng nhập
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

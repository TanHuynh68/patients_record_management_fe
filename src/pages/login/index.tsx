import { LoginForm } from "./login-form"

function LoginPage() {

  return (
    <div className="">
      <div className="flex h-screen flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm/>
          </div>
        </div>
      </div>
    </div>
  )
}
export default LoginPage

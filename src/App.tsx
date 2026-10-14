
import { RouterProvider } from "react-router-dom"
import { router } from "./config/router.config"

export function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { default as axios } from "axios"
import { useEffect, useState } from "react"
import { env } from "@/config/env.config"
import { Spinner } from "@/components/ui/spinner"
export type Gender = "MALE" | "FEMALE" | "OTHER"

export interface IEmergencyContact {
  fullName: string
  phone: string
  relationship?: string
}

export interface IPatient {
  _id: string
  patientCode: string
  fullName: string
  dateOfBirth: string // ISO date từ API
  gender: Gender
  phone?: string
  address?: string
  emergencyContact?: IEmergencyContact
  createdAt: string
  updatedAt: string
}

const DashboardPage = () => {
  const [data, setData] = useState<IPatient[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getPatients()
  }, [])

  const getPatients = async () => {
    try {
      const res = await axios.get(`${env.BE_URL}/patients`)
      console.log("yes")
      if (res) {
        setData(res.data.data)
      }
    } catch (error) {
      console.error("Get patients error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive patients={data} />
              </div>
              <DataTable data={data} getPatients={getPatients} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardPage


import { useEffect, useState, type FormEvent } from "react"
import { PencilIcon } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { env } from "@/config/env.config"
import { toast } from "./ui/toast"

type Gender = "MALE" | "FEMALE" | "OTHER"

type FormValues = {
  fullName: string
  dateOfBirth: string
  gender: Gender | ""
  phone: string
  address: string
  emergencyFullName: string
  emergencyPhone: string
  relationship: string
}

type Errors = Partial<Record<keyof FormValues, string>>

type Patient = {
  _id: string
  fullName: string
  dateOfBirth: string | Date
  gender: Gender
  phone?: string
  address?: string
  emergencyContact?: {
    fullName: string
    phone: string
    relationship?: string
  }
}


const phonePattern = /^(0|\+84)(3|5|7|8|9)\d{8}$/

function toDateInputValue(date: string | Date | undefined) {
  if (!date) return ""
  const value = date instanceof Date ? date.toISOString() : date
  return value.split("T")[0]
}

function toFormValues(patient: Patient): FormValues {
  return {
    fullName: patient.fullName ?? "",
    dateOfBirth: toDateInputValue(patient.dateOfBirth),
    gender: patient.gender ?? "",
    phone: patient.phone ?? "",
    address: patient.address ?? "",
    emergencyFullName: patient.emergencyContact?.fullName ?? "",
    emergencyPhone: patient.emergencyContact?.phone ?? "",
    relationship: patient.emergencyContact?.relationship ?? "",
  }
}

function validate(values: FormValues): Errors {
  const errors: Errors = {}
  const today = new Date().toISOString().split("T")[0]

  if (values.fullName.trim().length < 2) {
    errors.fullName = "Vui lòng nhập họ và tên hợp lệ."
  }
  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Vui lòng chọn ngày sinh."
  } else if (values.dateOfBirth > today) {
    errors.dateOfBirth = "Ngày sinh không được ở tương lai."
  }
  if (!values.gender) errors.gender = "Vui lòng chọn giới tính."
  if (!phonePattern.test(values.phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ."
  }
  if (values.address.trim().length < 5) {
    errors.address = "Vui lòng nhập địa chỉ cụ thể."
  }
  if (values.emergencyFullName.trim().length < 2) {
    errors.emergencyFullName = "Vui lòng nhập tên người liên hệ."
  }
  if (!phonePattern.test(values.emergencyPhone.replace(/\s/g, ""))) {
    errors.emergencyPhone = "Số điện thoại không hợp lệ."
  }
  if (!values.relationship.trim()) {
    errors.relationship = "Vui lòng nhập mối quan hệ."
  }

  return errors
}

export function UpdatePatientFormDialog({
  fetchPatients,
  dataUpdate,
}: {
  fetchPatients: () => Promise<void>
  dataUpdate: Patient
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<FormValues>(() => toFormValues(dataUpdate))
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    console.log("dataUpdate changed:", dataUpdate)
    if (open) {
      setValues(toFormValues(dataUpdate))
      setErrors({})
    }
  }, [dataUpdate, open])

  function update(field: keyof FormValues, value: string) {
     console.log("UPDATE:", field, value)
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const data = {
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth,
        gender: values.gender as Gender,
        phone: values.phone.replace(/\s/g, ""),
        address: values.address.trim(),
        emergencyContact: {
          fullName: values.emergencyFullName.trim(),
          phone: values.emergencyPhone.replace(/\s/g, ""),
          relationship: values.relationship.trim(),
        },
      }

      const response = await axios.patch(`${env.BE_URL}/patients/${dataUpdate._id}`, data)
      console.log('response: ', response)
      if (response && response.data.success) {
        await fetchPatients()
        setOpen(false)
        toast.add({ title: response.data?.message ?? "Cập nhật bệnh nhân thành công." })
      }
    } catch {
      toast.add({ title: "Không thể cập nhật bệnh nhân. Vui lòng thử lại." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PencilIcon data-icon="inline-start" />
            <span className="hidden lg:inline">Chỉnh sửa</span>
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bệnh nhân</DialogTitle>
          <DialogDescription>Cập nhật đầy đủ thông tin bệnh nhân.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Thông tin bệnh nhân</FieldLegend>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">Họ và tên *</FieldLabel>
                  <Input id="fullName" value={values.fullName} onChange={(event) => update("fullName", event.target.value)} aria-invalid={!!errors.fullName} />
                  <FieldError>{errors.fullName}</FieldError>
                </Field>
                <Field data-invalid={!!errors.dateOfBirth}>
                  <FieldLabel htmlFor="dateOfBirth">Ngày sinh *</FieldLabel>
                  <Input id="dateOfBirth" type="date" value={values.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} aria-invalid={!!errors.dateOfBirth} />
                  <FieldError>{errors.dateOfBirth}</FieldError>
                </Field>
                <Field data-invalid={!!errors.gender}>
                  <FieldLabel htmlFor="gender">Giới tính *</FieldLabel>
                  <Select value={values.gender} onValueChange={(value) => update("gender", value ?? "")}>
                    <SelectTrigger id="gender" className="w-full" aria-invalid={!!errors.gender}><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.gender}</FieldError>
                </Field>
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="phone">Số điện thoại *</FieldLabel>
                  <Input id="phone" type="tel" value={values.phone} onChange={(event) => update("phone", event.target.value)} aria-invalid={!!errors.phone} />
                  <FieldError>{errors.phone}</FieldError>
                </Field>
                <Field data-invalid={!!errors.address} className="sm:col-span-2">
                  <FieldLabel htmlFor="address">Địa chỉ *</FieldLabel>
                  <Textarea id="address" value={values.address} onChange={(event) => update("address", event.target.value)} aria-invalid={!!errors.address} rows={2} />
                  <FieldError>{errors.address}</FieldError>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Người liên hệ khẩn cấp</FieldLegend>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.emergencyFullName}>
                  <FieldLabel htmlFor="emergencyFullName">Họ và tên *</FieldLabel>
                  <Input id="emergencyFullName" value={values.emergencyFullName} onChange={(event) => update("emergencyFullName", event.target.value)} aria-invalid={!!errors.emergencyFullName} />
                  <FieldError>{errors.emergencyFullName}</FieldError>
                </Field>
                <Field data-invalid={!!errors.emergencyPhone}>
                  <FieldLabel htmlFor="emergencyPhone">Số điện thoại *</FieldLabel>
                  <Input id="emergencyPhone" type="tel" value={values.emergencyPhone} onChange={(event) => update("emergencyPhone", event.target.value)} aria-invalid={!!errors.emergencyPhone} />
                  <FieldError>{errors.emergencyPhone}</FieldError>
                </Field>
                <Field data-invalid={!!errors.relationship}>
                  <FieldLabel htmlFor="relationship">Mối quan hệ *</FieldLabel>
                  <Input id="relationship" value={values.relationship} onChange={(event) => update("relationship", event.target.value)} aria-invalid={!!errors.relationship} />
                  <FieldError>{errors.relationship}</FieldError>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang cập nhật..." : "Cập nhật bệnh nhân"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePatientFormDialog
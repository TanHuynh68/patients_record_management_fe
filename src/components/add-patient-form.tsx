"use client"

import { useState, type FormEvent } from "react"
import { PlusIcon } from "lucide-react"

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
  FieldDescription,
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
import axios from "axios"
import { env } from "@/config/env.config"
import { toast } from "./ui/toast"

type FormValues = {
  fullName: string
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  emergencyFullName: string
  emergencyPhone: string
  relationship: string
}

type Errors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  address: "",
  emergencyFullName: "",
  emergencyPhone: "",
  relationship: "",
}

const phonePattern = /^(0|\+84)(3|5|7|8|9)\d{8}$/

function validate(values: FormValues): Errors {
  const errors: Errors = {}
  const today = new Date().toISOString().split("T")[0]

  if (values.fullName.trim().length < 2)
    errors.fullName = "Vui lòng nhập họ và tên hợp lệ."
  if (!values.dateOfBirth) errors.dateOfBirth = "Vui lòng chọn ngày sinh."
  else if (values.dateOfBirth > today)
    errors.dateOfBirth = "Ngày sinh không được ở tương lai."
  if (!values.gender) errors.gender = "Vui lòng chọn giới tính."
  if (!phonePattern.test(values.phone.replace(/\s/g, "")))
    errors.phone = "Số điện thoại không hợp lệ."
  if (values.address.trim().length < 5)
    errors.address = "Vui lòng nhập địa chỉ cụ thể."
  if (values.emergencyFullName.trim().length < 2)
    errors.emergencyFullName = "Vui lòng nhập tên người liên hệ."
  if (!phonePattern.test(values.emergencyPhone.replace(/\s/g, "")))
    errors.emergencyPhone = "Số điện thoại không hợp lệ."
  if (!values.relationship.trim())
    errors.relationship = "Vui lòng nhập mối quan hệ."

  return errors
}

export function PatientFormDialog({
  fetchPatients,
}: {
  fetchPatients: any
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Errors>({})



  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    const res = await axios.post(env.BE_URL + "/patients", {
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      phone: values.phone.replace(/\s/g, ""),
      address: values.address.trim(),
      emergencyContact: {
        fullName: values.emergencyFullName.trim(),
        phone: values.emergencyPhone.replace(/\s/g, ""),
        relationship: values.relationship.trim(),
      },
    })
    console.log("[v0] New patient submitted", {
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      phone: values.phone.replace(/\s/g, ""),
      address: values.address.trim(),
      emergencyContact: {
        fullName: values.emergencyFullName.trim(),
        phone: values.emergencyPhone.replace(/\s/g, ""),
        relationship: values.relationship.trim(),
      },
    })
    setValues(initialValues)
    if (res && res.data.success) {
      await fetchPatients()
      setOpen(false)
      toast.add({ title: res.data.message })
    }
  }
 
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PlusIcon data-icon="inline-start" />
            <span className="hidden lg:inline">Thêm bệnh nhân</span>
            <span className="lg:hidden">Thêm</span>
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm bệnh nhân</DialogTitle>
          <DialogDescription>
            Nhập thông tin bệnh nhân và người liên hệ khẩn cấp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Thông tin bệnh nhân</FieldLegend>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">
                    Họ và tên <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="fullName"
                    value={values.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    aria-invalid={!!errors.fullName}
                    placeholder="Nguyễn Văn An"
                    autoComplete="name"
                  />
                  <FieldError>{errors.fullName}</FieldError>
                </Field>
                <Field data-invalid={!!errors.dateOfBirth}>
                  <FieldLabel htmlFor="dateOfBirth">
                    Ngày sinh <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={values.dateOfBirth}
                    onChange={(event) =>
                      update("dateOfBirth", event.target.value)
                    }
                    aria-invalid={!!errors.dateOfBirth}
                  />
                  <FieldError>{errors.dateOfBirth}</FieldError>
                </Field>
                <Field data-invalid={!!errors.gender}>
                  <FieldLabel htmlFor="gender">
                    Giới tính <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Select
                    value={
                      values.gender === "MALE"
                        ? "Nam"
                        : values.gender === "FEMALE"
                          ? "Nữ"
                          : ""
                    }
                    onValueChange={(value) => update("gender", value ?? "")}
                  >
                    <SelectTrigger
                      id="gender"
                      className="w-full"
                      aria-invalid={!!errors.gender}
                    >
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.gender}</FieldError>
                </Field>
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor="phone">
                    Số điện thoại <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    aria-invalid={!!errors.phone}
                    placeholder="0901 234 567"
                    autoComplete="tel"
                  />
                  <FieldError>{errors.phone}</FieldError>
                </Field>
                <Field
                  data-invalid={!!errors.address}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor="address">
                    Địa chỉ <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Textarea
                    id="address"
                    value={values.address}
                    onChange={(event) => update("address", event.target.value)}
                    aria-invalid={!!errors.address}
                    placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                    rows={2}
                  />
                  <FieldError>{errors.address}</FieldError>
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Người liên hệ khẩn cấp</FieldLegend>
              <FieldDescription>
                Thông tin này được dùng khi cần liên hệ trong trường hợp khẩn
                cấp.
              </FieldDescription>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.emergencyFullName}>
                  <FieldLabel htmlFor="emergencyFullName">
                    Họ và tên <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="emergencyFullName"
                    value={values.emergencyFullName}
                    onChange={(event) =>
                      update("emergencyFullName", event.target.value)
                    }
                    aria-invalid={!!errors.emergencyFullName}
                    placeholder="Nguyễn Thị B"
                    autoComplete="name"
                  />
                  <FieldError>{errors.emergencyFullName}</FieldError>
                </Field>
                <Field data-invalid={!!errors.emergencyPhone}>
                  <FieldLabel htmlFor="emergencyPhone">
                    Số điện thoại <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={values.emergencyPhone}
                    onChange={(event) =>
                      update("emergencyPhone", event.target.value)
                    }
                    aria-invalid={!!errors.emergencyPhone}
                    placeholder="0909 876 543"
                    autoComplete="tel"
                  />
                  <FieldError>{errors.emergencyPhone}</FieldError>
                </Field>
                <Field data-invalid={!!errors.relationship}>
                  <FieldLabel htmlFor="relationship">
                    Mối quan hệ <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    id="relationship"
                    value={values.relationship}
                    onChange={(event) =>
                      update("relationship", event.target.value)
                    }
                    aria-invalid={!!errors.relationship}
                    placeholder="Mẹ"
                  />
                  <FieldError>{errors.relationship}</FieldError>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu bệnh nhân</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PatientFormDialog

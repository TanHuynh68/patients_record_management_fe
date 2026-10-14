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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type DoctorFormValues = {
  fullName: string
  email: string
  password: string
}

type DoctorCreateDialogProps = {
  onCreate: (data: DoctorFormValues) => any
}

type FormErrors = Partial<Record<keyof DoctorFormValues, string>>

const initialValues: DoctorFormValues = {
  fullName: "",
  email: "",
  password: "",
}

function validate(values: DoctorFormValues): FormErrors {
  const errors: FormErrors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()

  if (!fullName) errors.fullName = "Vui lòng nhập họ và tên."
  else if (fullName.length < 2)
    errors.fullName = "Họ và tên phải có ít nhất 2 ký tự."
  else if (fullName.length > 100)
    errors.fullName = "Họ và tên không được vượt quá 100 ký tự."

  if (!email) errors.email = "Vui lòng nhập email."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ."
  }

  if (!values.password) errors.password = "Vui lòng nhập mật khẩu."
  else if (values.password.length < 8) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự."
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = "Mật khẩu phải gồm chữ cái và ít nhất một chữ số."
  }

  return errors
}

export function DoctorCreateDialog({ onCreate }: DoctorCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<DoctorFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: keyof DoctorFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError("")
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isSubmitting) {
      setValues(initialValues)
      setErrors({})
      setSubmitError("")
    }
    setOpen(nextOpen)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const res = await onCreate({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })
      if (res) {
        setValues(initialValues)
        setErrors({})
        setOpen(false)
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể tạo bác sĩ. Vui lòng thử lại."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <PlusIcon data-icon="inline-start" />
          <span className="hidden lg:inline">Thêm bác sĩ</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Thêm bác sĩ mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin tài khoản để tạo hồ sơ bác sĩ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.fullName)}>
              <FieldLabel htmlFor="doctor-full-name">Họ và tên</FieldLabel>
              <Input
                id="doctor-full-name"
                value={values.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                placeholder="Nguyễn Văn An"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                disabled={isSubmitting}
              />
              {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="doctor-email">Email</FieldLabel>
              <Input
                id="doctor-email"
                type="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="bacsi@hospital.vn"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                disabled={isSubmitting}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="doctor-password">Mật khẩu</FieldLabel>
              <Input
                id="doctor-password"
                type="password"
                value={values.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                disabled={isSubmitting}
              />
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>

            {submitError && <FieldError>{submitError}</FieldError>}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo bác sĩ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type { DoctorFormValues }
export default DoctorCreateDialog

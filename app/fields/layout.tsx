import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Engineering Fields - Pump Gravity",
  description: "Specialized calculators for mechanical and electrical engineering fields",
}

export default function FieldsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
import { getDictionary } from "@/dictionaries"
import PublicLayout from "./layout-client"
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const dict = await getDictionary(params.lang)

  if (!dict) {
    notFound()
  }
  
  return (
    <PublicLayout params={{ dict }}>
      {children}
    </PublicLayout>
  )
}

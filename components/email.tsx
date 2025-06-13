import { Font, Html } from "@react-email/components"

import { Tailwind } from "@react-email/components"

const Email = ({ children }: { children: React.ReactNode }) => {
  return (
    <Tailwind>
      <Html>
        <Font fontFamily="Montserrat" fallbackFontFamily="Verdana" />
        {children}
      </Html>
    </Tailwind>
  )
}

export default Email;
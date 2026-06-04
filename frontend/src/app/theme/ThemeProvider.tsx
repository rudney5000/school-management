import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ReactNode } from "react"

export function ThemeProvider({
                                  children,
                                  ...props
                              }: {
    children: ReactNode
} & React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
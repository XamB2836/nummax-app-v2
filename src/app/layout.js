// FONT
// Using system fonts during build to avoid external requests.

// THEME PROVIDER
import { ThemeProvider } from "@/components/Dashboard/theme-provider"



// STYLES
import "@/styles/DashBoard.css"
export const metadata = {
  title: "Nummax Designer App",
  description: "Internal tools for Nummax employees",
};

// THEME LAYOUT
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#121212] text-[#E0E0E0]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
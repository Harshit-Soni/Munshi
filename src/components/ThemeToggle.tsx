import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { effectiveTheme, toggleTheme } from '@/lib/theme'

export function ThemeToggle({ onChange }: { onChange?: () => void }) {
  const [theme, setTheme] = useState(effectiveTheme())
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => {
        toggleTheme()
        setTheme(effectiveTheme())
        onChange?.()
      }}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}

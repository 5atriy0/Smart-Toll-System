import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface ShortcutCardProps {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}

export function ShortcutCard({ title, desc, href, icon }: ShortcutCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full hover:bg-white/5 transition-colors cursor-pointer group border-border/50">
        <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              {title}
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

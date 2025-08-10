import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Home, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Verification", url: "/verify", icon: CheckCircle2 },
  { title: "Admin", url: "/admin", icon: Shield },
];

const getNavCls = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-primary font-medium border-b-2 border-primary"
    : "text-muted-foreground hover:text-foreground";

export default function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="font-semibold tracking-tight">
          ibnOrigin
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {items.map((item) => (
            <NavLink key={item.title} to={item.url} end className={getNavCls}>
              {item.title}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="z-50">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 grid gap-2" aria-label="Mobile">
                {items.map((item) => (
                  <Button key={item.title} variant="ghost" asChild onClick={() => setOpen(false)} className="justify-start">
                    <NavLink to={item.url} end className={({ isActive }) => (isActive ? "text-primary font-medium" : "") }>
                      <span className="inline-flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </span>
                    </NavLink>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

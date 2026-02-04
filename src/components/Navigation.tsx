import { Link, useLocation } from 'react-router-dom';
import { Menu, Compass, Users, Layers, Sparkles, FileDown, Briefcase, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  to: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', description: 'Landing page', icon: Home },
  { to: '/editor', label: 'Profile Editor', description: 'Create and edit value profiles', icon: Compass },
  { to: '/compare', label: 'Compare Profiles', description: 'Compare two profiles side-by-side', icon: Users },
  { to: '/carriers', label: 'Tension Carriers', description: 'Explore value polarities', icon: Layers },
  { to: '/scenarios', label: 'Explore Scenarios', description: 'AI-generated conflict scenarios', icon: Sparkles },
  { to: '/job-analysis', label: 'Job Analysis', description: 'Analyze job descriptions', icon: Briefcase },
  { to: '/export', label: 'Data Export', description: 'Export profiles as JSON', icon: FileDown },
  { to: '/research', label: 'Research Background', description: 'Literature review', icon: BookOpen },
];

interface NavigationProps {
  title: string;
  description?: string;
}

export function Navigation({ title, description }: NavigationProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container py-4 flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentPath === item.to;

              return (
                <div key={item.to}>
                  {index === 1 && <DropdownMenuSeparator />}
                  {index === NAV_ITEMS.length - 1 && <DropdownMenuSeparator />}
                  <DropdownMenuItem asChild disabled={isActive}>
                    <Link
                      to={item.to}
                      className={`flex items-start gap-3 py-2 ${isActive ? 'bg-muted' : ''}`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl sm:text-2xl font-bold truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate hidden sm:block">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

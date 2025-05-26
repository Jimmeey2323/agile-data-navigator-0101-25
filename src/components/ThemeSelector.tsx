
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span>Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Choose Theme</h4>
          </div>
          
          <div className="grid gap-3">
            {themes.map((themeOption) => (
              <Card 
                key={themeOption.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  theme === themeOption.id ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => setTheme(themeOption.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: themeOption.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: themeOption.accentColor }}
                        />
                        <span className="font-medium text-sm">{themeOption.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                    </div>
                    {theme === themeOption.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

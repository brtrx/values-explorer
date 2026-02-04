import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';

const AVAILABLE_TABLES = [
  { name: 'profiles', label: 'Profiles' },
] as const;

type TableName = typeof AVAILABLE_TABLES[number]['name'];

export default function DataExport() {
  const [selectedTable, setSelectedTable] = useState<TableName | ''>('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = typeof value === 'object' 
            ? JSON.stringify(value) 
            : String(value ?? '');
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const handleExport = async () => {
    if (!selectedTable) {
      toast({
        title: 'Select a table',
        description: 'Please select a table to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'No data',
          description: 'The selected table has no data to export.',
        });
        return;
      }

      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTable}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `Exported ${data.length} rows from ${selectedTable}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        title="Data Export"
        description="Download database tables as CSV"
      />

      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Export
            </CardTitle>
            <CardDescription>
              Download any database table as a CSV file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Table</label>
              <Select value={selectedTable} onValueChange={(v) => setSelectedTable(v as TableName)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a table..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TABLES.map((table) => (
                    <SelectItem key={table.name} value={table.name}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={!selectedTable || isExporting}
              className="w-full"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export as CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

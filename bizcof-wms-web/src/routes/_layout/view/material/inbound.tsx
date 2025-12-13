import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/material/inbound')({
  component: MaterialInbound,
});

function MaterialInbound() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            자재 입고 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            준비 중입니다
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

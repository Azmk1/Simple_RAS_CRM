import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Users, FileText, ClipboardCheck, Calendar, Activity } from 'lucide-react';

export default function MasterOperationsPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-black text-white ">MASTER OPERATIONS</h1>
        <p className="text-brand-blue-400">Overlook all organizational portals and pipelines from a single view.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        {/* Portal 1 */}
        <Link href="/portal-case">
          <Card className="hover:border-brand-orange-500 transition-colors cursor-pointer h-full group">
            <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
              <Users className="w-5 h-5 text-brand-orange-500 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg text-white">Intake / PA Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Manage new clients, collect data, and route to Billing.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Portal 2 */}
        <Link href="/portal-billing">
          <Card className="hover:border-brand-blue-500 transition-colors cursor-pointer h-full group">
            <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
              <FileText className="w-5 h-5 text-brand-blue-500 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg text-white">Billing Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Process Prior Authorizations and integrate with Plutus.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Portal 3 */}
        <Link href="/portal-clinical">
          <Card className="hover:border-brand-orange-500 transition-colors cursor-pointer h-full group">
            <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
              <ClipboardCheck className="w-5 h-5 text-brand-orange-500 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg text-white">Clinical Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Clinical Support and BCBA workflows & oversight.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Portal 4 */}
        <Link href="/portal-hr">
          <Card className="hover:border-brand-blue-500 transition-colors cursor-pointer h-full group">
            <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
              <Users className="w-5 h-5 text-brand-blue-500 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg text-white">HR & Staffing Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Extract RBT data from HRM and assign clinical teams.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Portal 5 */}
        <Link href="/portal-case-coord">
          <Card className="hover:border-brand-orange-500 transition-colors cursor-pointer h-full group">
            <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
              <Calendar className="w-5 h-5 text-brand-orange-500 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-lg text-white">Case Coordinator Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">Manage case forms and coordinate start dates.</p>
            </CardContent>
          </Card>
        </Link>
        
      </div>
    </div>
  );
}

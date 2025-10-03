import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Building2, Settings, Users, DollarSign, Shield } from "lucide-react";
import { CompanyRegistration } from "./CompanyRegistration";
import { CompanyOps } from "./CompanyOps";

export function CompanyPortal() {
  const [activeSection, setActiveSection] = useState<'registration' | 'operations'>('registration');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your company settings and operations</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Building2 className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Company Management Hub</h3>
            <p className="text-sm text-gray-600">
              This portal allows you to register your company on-chain, manage operations,
              and configure payroll settings. Your wallet address serves as your unique company identifier.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('registration')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'registration'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company Registration
          </div>
        </button>
        <button
          onClick={() => setActiveSection('operations')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeSection === 'operations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operations
          </div>
        </button>
      </div>

      {/* Company Registration Section */}
      {activeSection === 'registration' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Register Your Company
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <h4 className="font-semibold text-blue-900 mb-2">🏢 Why Register Your Company?</h4>
                <ul className="space-y-1 text-blue-800">
                  <li>• Immutable blockchain record of your company</li>
                  <li>• Unique on-chain identifier (your wallet address)</li>
                  <li>• Enable payroll processing for employees</li>
                  <li>• Access to tax compliance and reporting features</li>
                  <li>• Automated payment scheduling capabilities</li>
                </ul>
              </div>
              <CompanyRegistration />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manage</p>
                    <p className="text-lg font-bold text-gray-900">Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Process</p>
                    <p className="text-lg font-bold text-gray-900">Payroll</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ensure</p>
                    <p className="text-lg font-bold text-gray-900">Compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Operations Section */}
      {activeSection === 'operations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Company Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <h4 className="font-semibold text-amber-900 mb-2">⚡ Quick Operations</h4>
                <p className="text-amber-800">
                  Manage your company's blockchain operations including funding treasury,
                  adding employees, and processing direct payments.
                </p>
              </div>
              <CompanyOps />
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Register Your Company</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Connect your wallet and register your company name on the blockchain.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Fund Your Treasury</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Add APT tokens to your company treasury to enable payroll processing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Add Employees</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Navigate to Employees → Add Employee to onboard your team members.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Process Payroll</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Use the Payroll section to send payments manually or set up automated schedules.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

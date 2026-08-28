import React, { useState, useEffect } from 'react'
import { Wifi, Clock, Zap, Download, Phone } from 'lucide-react'
import { formatCurrency, formatDuration } from '../utils/formatters'
import { publicAPI } from '../services/api'
import toast from 'react-hot-toast'
import type { Plan } from '../types'

const CustomerPortal: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await publicAPI.getPlans()
      if (response.success && response.data) {
        setPlans(response.data)
      }
    } catch (error) {
      toast.error('Failed to load plans')
    }
  }

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
  }

  const closeModal = () => {
    setSelectedPlan(null)
  }

  const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
          <Wifi className="w-6 h-6 text-primary-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        {plan.description && (
          <p className="text-gray-600 mb-4">{plan.description}</p>
        )}
        
        <div className="text-3xl font-bold text-primary-600 mb-4">
          {formatCurrency(plan.price)}
          <span className="text-sm text-gray-500 font-normal">/{formatDuration(plan.duration)}</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Zap className="w-4 h-4 mr-2 text-green-500" />
            Speed: {plan.speedLimit}
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Download className="w-4 h-4 mr-2 text-blue-500" />
            Data: {plan.dataLimit}
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-green-500" />
            Valid for {formatDuration(plan.duration)}
          </div>
        </div>

        <button
          onClick={() => handleSelectPlan(plan)}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          View Plan
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Wifi className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">COLLOSPOT</h1>
            </div>
            <p className="text-lg text-gray-600 mb-2">Smart WiFi Billing for the Modern Kenyan Network</p>
            <p className="text-sm text-gray-500 italic">"Connect. Browse — Seamlessly."</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Internet Plan</h2>
          <p className="text-gray-600">Browse available plans and contact us to activate your connection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* How it Works */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Plan</h3>
              <p className="text-sm text-gray-600">Select the internet plan that suits your needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600">Reach out to activate your chosen plan</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Connected</h3>
              <p className="text-sm text-gray-600">We activate your internet access</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Start Browsing</h3>
              <p className="text-sm text-gray-600">Enjoy high-speed internet access immediately</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedPlan.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(selectedPlan.price)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDuration(selectedPlan.duration)} • {selectedPlan.dataLimit} • {selectedPlan.speedLimit}
              </p>
              {selectedPlan.description && (
                <p className="text-sm text-gray-600 mt-3">{selectedPlan.description}</p>
              )}
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Online payments are currently disabled. To activate this plan, please contact
                  our support team.
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6 text-primary-400 mr-2" />
              <span className="text-xl font-bold">COLLOSPOT</span>
            </div>
            <p className="text-gray-400 mb-4">Smart WiFi Billing for the Modern Kenyan Network</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <span>📞 Support: +254 700 000 000</span>
              <span>📧 support@collospot.com</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CustomerPortal

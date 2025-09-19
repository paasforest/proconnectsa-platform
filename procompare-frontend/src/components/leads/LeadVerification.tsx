'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Phone, 
  Mail, 
  MapPin,
  AlertTriangle,
  Eye,
  Lock,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'verifying' | 'verified' | 'failed'
  icon: any
  required: boolean
}

interface LeadVerificationProps {
  leadId: string
  onVerificationComplete: (verified: boolean) => void
  onCancel: () => void
}

const verificationSteps: VerificationStep[] = [
  {
    id: 'phone',
    title: 'Phone Verification',
    description: 'We\'ll send you a verification code via SMS',
    status: 'pending',
    icon: Phone,
    required: true
  },
  {
    id: 'email',
    title: 'Email Verification',
    description: 'Check your email for a verification link',
    status: 'pending',
    icon: Mail,
    required: true
  },
  {
    id: 'location',
    title: 'Location Verification',
    description: 'Verify your address and location',
    status: 'pending',
    icon: MapPin,
    required: true
  },
  {
    id: 'identity',
    title: 'Identity Check',
    description: 'Quick identity verification process',
    status: 'pending',
    icon: Shield,
    required: false
  }
]

export default function LeadVerification({ leadId, onVerificationComplete, onCancel }: LeadVerificationProps) {
  const [steps, setSteps] = useState<VerificationStep[]>(verificationSteps)
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)

  const currentStepData = steps[currentStep]
  const completedSteps = steps.filter(step => step.status === 'verified').length
  const requiredSteps = steps.filter(step => step.required).length
  const requiredCompleted = steps.filter(step => step.required && step.status === 'verified').length

  const startVerification = async (stepId: string) => {
    setIsVerifying(true)
    
    // Update step status to verifying
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'verifying' as const }
        : step
    ))

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success/failure
      const success = Math.random() > 0.2 // 80% success rate
      
      setSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, status: success ? 'verified' as const : 'failed' as const }
          : step
      ))

      if (success) {
        toast.success(`${currentStepData.title} verified successfully!`)
        
        // Move to next step if not the last one
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1)
        } else {
          // All steps completed
          setVerificationComplete(true)
          onVerificationComplete(true)
        }
      } else {
        toast.error(`${currentStepData.title} verification failed. Please try again.`)
      }
    } catch (error) {
      setSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, status: 'failed' as const }
          : step
      ))
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCodeSubmit = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code')
      return
    }

    await startVerification('phone')
  }

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'phone':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone Verification</h3>
              <p className="text-gray-600 mb-4">
                We'll send a verification code to your phone number
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-lg"
                maxLength={6}
              />
              
              <Button 
                onClick={handleCodeSubmit}
                disabled={!verificationCode || isVerifying}
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => startVerification('phone')}
                disabled={isVerifying}
                className="w-full"
              >
                Resend Code
              </Button>
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Verification</h3>
              <p className="text-gray-600 mb-4">
                Check your email for a verification link and click it to verify
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Check your email inbox and spam folder
                </span>
              </div>
            </div>
            
            <Button 
              onClick={() => startVerification('email')}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'I\'ve Clicked the Link'}
            </Button>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Location Verification</h3>
              <p className="text-gray-600 mb-4">
                Please confirm your address and location details
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-medium">123 Main Street, Cape Town</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Suburb</div>
                <div className="font-medium">Sea Point</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">City</div>
                <div className="font-medium">Cape Town</div>
              </div>
            </div>
            
            <Button 
              onClick={() => startVerification('location')}
              disabled={isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Confirm Location'}
            </Button>
          </div>
        )

      case 'identity':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Identity Check</h3>
              <p className="text-gray-600 mb-4">
                Quick identity verification to ensure you're a real person
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  This step is optional but helps prevent fraud
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => startVerification('identity')}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify Identity'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentStep(currentStep + 1)
                  setVerificationComplete(true)
                  onVerificationComplete(true)
                }}
                className="w-full"
              >
                Skip This Step
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (verificationComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Verification Complete!
          </h2>
          <p className="text-green-600 mb-6">
            Your lead has been verified and will be sent to qualified providers.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <a href="/client">Go to Dashboard</a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/request-quote">Submit Another Request</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Lead Verification</CardTitle>
              <CardDescription>
                We need to verify your information to prevent fraud and ensure quality
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completedSteps}/{steps.length} completed</span>
            </div>
            <Progress value={(completedSteps / steps.length) * 100} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Step indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = step.status === 'verified'
                const isFailed = step.status === 'failed'
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isFailed
                        ? 'bg-red-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isFailed ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-xs text-center max-w-20">
                      {step.title}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Current step content */}
            <div className="border-t pt-6">
              {renderStepContent()}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              
              <div className="text-sm text-gray-500">
                {requiredCompleted}/{requiredSteps} required steps completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






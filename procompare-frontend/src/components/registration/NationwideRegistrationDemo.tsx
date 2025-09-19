/**
 * Demonstration of Nationwide Provider Registration
 * Shows how ProConnectSA supports expansion across all South African cities
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building, Users, TrendingUp } from 'lucide-react'
import { CITIES, CITY_NAMES, getCityAreas, MAJOR_METROS, PROVINCES, getCitiesByProvince } from '@/constants/locations'

export default function NationwideRegistrationDemo() {
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  const availableCities = selectedProvince ? getCitiesByProvince(selectedProvince) : []
  const availableAreas = selectedCity ? getCityAreas(selectedCity) : []

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌍 ProConnectSA Nationwide Registration
        </h1>
        <p className="text-gray-600">
          Designed for expansion across all 9 South African provinces
        </p>
      </div>

      {/* Current Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{CITY_NAMES.length}</div>
            <div className="text-sm text-gray-600">Cities Ready</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">300+</div>
            <div className="text-sm text-gray-600">Service Areas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">9</div>
            <div className="text-sm text-gray-600">Provinces</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">∞</div>
            <div className="text-sm text-gray-600">Expandable</div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Registration Demo */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Interactive Registration Demo</CardTitle>
          <p className="text-sm text-gray-600">
            See how providers can register from anywhere in South Africa
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Province Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">1. Select Province</label>
            <Select onValueChange={(value) => {
              setSelectedProvince(value)
              setSelectedCity('')
              setSelectedAreas([])
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Selection */}
          {selectedProvince && (
            <div>
              <label className="block text-sm font-medium mb-2">2. Select City</label>
              <Select onValueChange={(value) => {
                setSelectedCity(value)
                setSelectedAreas([])
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your city" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                      {MAJOR_METROS.includes(city) && (
                        <Badge variant="secondary" className="ml-2">Major Metro</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service Areas */}
          {selectedCity && (
            <div>
              <label className="block text-sm font-medium mb-2">
                3. Select Service Areas in {selectedCity}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {availableAreas.map((area) => (
                  <label
                    key={area}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedAreas.includes(area)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAreaToggle(area)}
                  >
                    <div className="text-sm">{area}</div>
                  </label>
                ))}
              </div>
              
              {selectedAreas.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Selected Areas ({selectedAreas.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {selectedCity && selectedAreas.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-900 mb-2">✅ Registration Ready!</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Province:</strong> {selectedProvince}</p>
                <p><strong>City:</strong> {selectedCity}</p>
                <p><strong>Service Areas:</strong> {selectedAreas.length} selected</p>
                <p className="mt-2 font-medium">
                  🚀 Provider can now receive leads from {selectedCity}!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expansion Plan */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Expansion Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-green-700 mb-2">✅ Phase 1: Active</h3>
              <div className="space-y-1 text-sm">
                {MAJOR_METROS.map(city => (
                  <div key={city} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {city}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-700 mb-2">🔄 Phase 2: Ready</h3>
              <div className="space-y-1 text-sm">
                {CITY_NAMES.filter(city => !MAJOR_METROS.includes(city)).slice(0, 4).map(city => (
                  <div key={city} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {city}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">📋 Phase 3: Planned</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Polokwane
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  George
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Pietermaritzburg
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  + Many More
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Technical Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">🎯 Smart Matching</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dynamic city-based filtering</li>
                <li>• Automatic area-to-provider matching</li>
                <li>• No hardcoded limitations</li>
                <li>• Instant expansion capability</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">🔧 Easy Expansion</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add new cities via configuration</li>
                <li>• No code changes required</li>
                <li>• Automatic UI updates</li>
                <li>• Scalable architecture</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



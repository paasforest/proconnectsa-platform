"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  X,
  RefreshCw
} from 'lucide-react';

interface LeadFiltersProps {
  serviceCategories: string[];
  serviceAreas: string[];
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

interface FilterState {
  search: string;
  serviceCategory: string;
  serviceArea: string;
  budgetRange: string;
  urgency: string;
  maxDistance: number;
  minRating: number;
  verifiedOnly: boolean;
}

const BUDGET_RANGES = [
  { value: 'all', label: 'All Budgets' },
  { value: 'under_1000', label: 'Under R1,000' },
  { value: '1000_5000', label: 'R1,000 - R5,000' },
  { value: '5000_15000', label: 'R5,000 - R15,000' },
  { value: '15000_50000', label: 'R15,000 - R50,000' },
  { value: 'over_50000', label: 'Over R50,000' }
];

const URGENCY_LEVELS = [
  { value: 'all', label: 'All Urgency' },
  { value: 'urgent', label: 'Urgent (ASAP)' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'flexible', label: 'Flexible' }
];

const DISTANCE_OPTIONS = [
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 25, label: '25km' },
  { value: 50, label: '50km' }
];

export default function LeadFilters({ 
  serviceCategories, 
  serviceAreas, 
  onFiltersChange, 
  onClearFilters,
  loading = false
}: LeadFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    serviceCategory: 'all',
    serviceArea: 'all',
    budgetRange: 'all',
    urgency: 'all',
    maxDistance: 50,
    minRating: 0,
    verifiedOnly: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      serviceCategory: 'all',
      serviceArea: 'all',
      budgetRange: 'all',
      urgency: 'all',
      maxDistance: 50,
      minRating: 0,
      verifiedOnly: false
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.serviceCategory !== 'all') count++;
    if (filters.serviceArea !== 'all') count++;
    if (filters.budgetRange !== 'all') count++;
    if (filters.urgency !== 'all') count++;
    if (filters.maxDistance !== 50) count++;
    if (filters.minRating > 0) count++;
    if (filters.verifiedOnly) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Leads
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search leads..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Service Category */}
          <div>
            <Label htmlFor="serviceCategory">Service Category</Label>
            <Select
              value={filters.serviceCategory}
              onValueChange={(value) => handleFilterChange('serviceCategory', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Area */}
          <div>
            <Label htmlFor="serviceArea">Service Area</Label>
            <Select
              value={filters.serviceArea}
              onValueChange={(value) => handleFilterChange('serviceArea', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {serviceAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div>
            <Label htmlFor="budgetRange">Budget Range</Label>
            <Select
              value={filters.budgetRange}
              onValueChange={(value) => handleFilterChange('budgetRange', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Budgets" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Urgency */}
              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={filters.urgency}
                  onValueChange={(value) => handleFilterChange('urgency', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Distance */}
              <div>
                <Label htmlFor="maxDistance">Max Distance</Label>
                <Select
                  value={filters.maxDistance.toString()}
                  onValueChange={(value) => handleFilterChange('maxDistance', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Max Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Rating */}
              <div>
                <Label htmlFor="minRating">Min Rating</Label>
                <Select
                  value={filters.minRating.toString()}
                  onValueChange={(value) => handleFilterChange('minRating', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Min Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
                  disabled={loading}
                />
                <Label htmlFor="verifiedOnly" className="text-sm">
                  Verified leads only
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Active Filters:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.serviceCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {filters.serviceCategory.replace('_', ' ').toUpperCase()}
                  <button
                    onClick={() => handleFilterChange('serviceCategory', 'all')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.serviceArea !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Area: {filters.serviceArea}
                  <button
                    onClick={() => handleFilterChange('serviceArea', 'all')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.budgetRange !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Budget: {BUDGET_RANGES.find(r => r.value === filters.budgetRange)?.label}
                  <button
                    onClick={() => handleFilterChange('budgetRange', 'all')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.urgency !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Urgency: {URGENCY_LEVELS.find(u => u.value === filters.urgency)?.label}
                  <button
                    onClick={() => handleFilterChange('urgency', 'all')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.maxDistance !== 50 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Max Distance: {filters.maxDistance}km
                  <button
                    onClick={() => handleFilterChange('maxDistance', 50)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.minRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Min Rating: {filters.minRating}+ stars
                  <button
                    onClick={() => handleFilterChange('minRating', 0)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.verifiedOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Verified Only
                  <button
                    onClick={() => handleFilterChange('verifiedOnly', false)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}








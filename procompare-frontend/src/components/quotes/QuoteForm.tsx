'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Plus,
  Trash2,
  Save,
  Send
} from 'lucide-react'
import { toast } from 'sonner'

const quoteSchema = z.object({
  title: z.string().min(1, 'Quote title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  totalAmount: z.number().min(0, 'Amount must be positive'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  terms: z.string().min(10, 'Terms must be at least 10 characters'),
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, 'Item description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    total: z.number()
  })).min(1, 'At least one item is required')
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface QuoteFormProps {
  leadId: string
  leadTitle: string
  leadBudget: number
  clientName: string
  onSubmit: (quoteData: QuoteFormData) => void
  onSaveDraft: (quoteData: QuoteFormData) => void
  isLoading?: boolean
}

export function QuoteForm({
  leadId,
  leadTitle,
  leadBudget,
  clientName,
  onSubmit,
  onSaveDraft,
  isLoading = false
}: QuoteFormProps) {
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      title: `Quote for ${leadTitle}`,
      description: '',
      totalAmount: 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      estimatedDuration: '',
      terms: 'Payment terms: 50% deposit required before work begins, balance due upon completion. All work guaranteed for 12 months.',
      items: items
    }
  })

  const watchedItems = watch('items', items)
  const totalAmount = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  // Update total amount when items change
  React.useEffect(() => {
    setValue('totalAmount', totalAmount)
  }, [totalAmount, setValue])

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    const newItems = [...items, newItem]
    setItems(newItems)
    setValue('items', newItems)
  }

  const removeItem = (itemId: string) => {
    if (items.length > 1) {
      const newItems = items.filter(item => item.id !== itemId)
      setItems(newItems)
      setValue('items', newItems)
    }
  }

  const updateItem = (itemId: string, field: keyof QuoteItem, value: string | number) => {
    const newItems = items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
        }
        return updatedItem
      }
      return item
    })
    setItems(newItems)
    setValue('items', newItems)
  }

  const onFormSubmit = (data: QuoteFormData) => {
    onSubmit(data)
  }

  const onFormSaveDraft = () => {
    const formData = {
      title: watch('title'),
      description: watch('description'),
      totalAmount: totalAmount,
      validUntil: watch('validUntil'),
      estimatedDuration: watch('estimatedDuration'),
      terms: watch('terms'),
      items: items
    }
    onSaveDraft(formData)
  }

  const budgetDifference = totalAmount - leadBudget
  const isOverBudget = budgetDifference > 0

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Create Quote</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-600">
              Lead: {leadTitle}
            </Badge>
            <Badge variant="outline" className="text-green-600">
              Client: {clientName}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quote Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter quote title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration</Label>
              <Input
                id="estimatedDuration"
                {...register('estimatedDuration')}
                placeholder="e.g., 2-3 weeks, 5 days"
              />
              {errors.estimatedDuration && (
                <p className="text-sm text-red-600">{errors.estimatedDuration.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Quote Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the work to be performed, materials used, and any special considerations..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Quote Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Quote Items</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`item-${item.id}-description`}>Description</Label>
                      <Input
                        id={`item-${item.id}-description`}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`item-${item.id}-quantity`}>Quantity</Label>
                      <Input
                        id={`item-${item.id}-quantity`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`item-${item.id}-unitPrice`}>Unit Price (R)</Label>
                      <Input
                        id={`item-${item.id}-unitPrice`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Label>Total (R)</Label>
                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                          <span className="font-semibold">{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quote Summary */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quote Summary</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Client Budget</p>
                    <p className="text-lg font-semibold text-green-600">R{leadBudget.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Quote</p>
                    <p className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                      R{totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {isOverBudget && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Your quote is R{budgetDifference.toLocaleString()} over the client's budget
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-2xl font-bold border-t pt-4">
                <span>Total Amount:</span>
                <span className="text-blue-600">R{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Validity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                {...register('validUntil')}
              />
              {errors.validUntil && (
                <p className="text-sm text-red-600">{errors.validUntil.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <Textarea
                id="terms"
                {...register('terms')}
                placeholder="Enter payment terms and conditions"
                rows={3}
              />
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={onFormSaveDraft}
                variant="outline"
                disabled={!isDirty || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                type="submit"
                disabled={isLoading || totalAmount === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Quote'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}









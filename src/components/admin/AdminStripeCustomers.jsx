import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Users, RefreshCw, DollarSign, Calendar, AlertCircle, CreditCard, Mail, User, Eye, Edit, FileText, Plus, ArrowUpDown } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import { format } from 'date-fns';

export default function AdminStripeCustomers() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedSubForChange, setSelectedSubForChange] = useState(null);
  const [newPriceId, setNewPriceId] = useState('');
  const [createSubDialogOpen, setCreateSubDialogOpen] = useState(false);
  const [createSubCustomerId, setCreateSubCustomerId] = useState('');
  const [createSubPriceId, setCreateSubPriceId] = useState('');
  const [createSubTrialDays, setCreateSubTrialDays] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ['stripe-customers'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listStripeCustomers', {});
      return data;
    }
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async ({ subscriptionId, cancelAtPeriodEnd }) => {
      const { data } = await base44.functions.invoke('cancelStripeSubscription', {
        subscriptionId,
        cancelAtPeriodEnd
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-customers']);
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ subscriptionId, newPriceId }) => {
      const { data } = await base44.functions.invoke('updateSubscriptionPlan', {
        subscriptionId,
        newPriceId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-customers']);
      setChangePlanDialogOpen(false);
      setSelectedSubForChange(null);
      setNewPriceId('');
    }
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ customerId, priceId, trialDays }) => {
      const { data } = await base44.functions.invoke('createManualSubscription', {
        customerId,
        priceId,
        trialDays: trialDays ? parseInt(trialDays) : undefined
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-customers']);
      setCreateSubDialogOpen(false);
      setCreateSubCustomerId('');
      setCreateSubPriceId('');
      setCreateSubTrialDays('');
    }
  });

  const { data: productsData } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listStripeProducts');
      return data;
    }
  });

  const handleCancelSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!selectedSubscription) return;
    cancelSubscriptionMutation.mutate({
      subscriptionId: selectedSubscription.id,
      cancelAtPeriodEnd
    });
  };

  const handleViewCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerDetailsOpen(true);
    setLoadingDetails(true);
    try {
      const { data } = await base44.functions.invoke('getCustomerDetails', { customerId: customer.id });
      setCustomerDetails(data);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChangePlan = (subscription) => {
    setSelectedSubForChange(subscription);
    setChangePlanDialogOpen(true);
  };

  const confirmChangePlan = () => {
    if (!selectedSubForChange || !newPriceId) return;
    updateSubscriptionMutation.mutate({
      subscriptionId: selectedSubForChange.id,
      newPriceId
    });
  };

  const handleCreateSubscription = (customerId) => {
    setCreateSubCustomerId(customerId);
    setCreateSubDialogOpen(true);
  };

  const confirmCreateSubscription = () => {
    if (!createSubCustomerId || !createSubPriceId) return;
    createSubscriptionMutation.mutate({
      customerId: createSubCustomerId,
      priceId: createSubPriceId,
      trialDays: createSubTrialDays
    });
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatRecurringInterval = (recurring) => {
    if (!recurring) return '';
    const { interval, interval_count } = recurring;
    
    if (interval_count === 1) {
      return `/ ${interval}`;
    }
    
    const intervalLabels = {
      day: 'days',
      week: 'weeks',
      month: 'months',
      year: 'years'
    };
    
    return `every ${interval_count} ${intervalLabels[interval] || interval}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-500/20 text-green-400', label: 'Active' },
      trialing: { color: 'bg-blue-500/20 text-blue-400', label: 'Trialing' },
      past_due: { color: 'bg-orange-500/20 text-orange-400', label: 'Past Due' },
      canceled: { color: 'bg-red-500/20 text-red-400', label: 'Canceled' },
      incomplete: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Incomplete' },
      unpaid: { color: 'bg-red-500/20 text-red-400', label: 'Unpaid' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-400', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredCustomers = customersData?.data?.filter(customer => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        customer.email?.toLowerCase().includes(query) ||
        customer.name?.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      const hasMatchingStatus = customer.subscriptions?.data?.some(sub => sub.status === statusFilter);
      if (!hasMatchingStatus) return false;
    }

    // Product filter
    if (productFilter !== 'all') {
      const hasMatchingProduct = customer.subscriptions?.data?.some(sub => 
        sub.items.data[0]?.price?.product === productFilter
      );
      if (!hasMatchingProduct) return false;
    }

    return true;
  }) || [];

  const allProducts = productsData?.products?.map(p => p.product) || [];
  const allPrices = productsData?.products?.flatMap(p => p.prices) || [];

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stripe Customers & Subscriptions</h2>
          <p className="text-sm text-white/60 mt-1">Manage customer subscriptions and billing</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search by email, name, or customer ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[300px] bg-white/5 border-white/10 text-white"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {allProducts.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/40">
              {searchQuery ? 'No customers found matching your search.' : 'No customers yet.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <GlassCard key={customer.id} className="p-6">
              {/* Customer Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5" style={{ color: theme.accent }} />
                    <h3 className="text-lg font-semibold text-white">
                      {customer.name || 'No name'}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    {customer.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {customer.id}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewCustomerDetails(customer)}
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleCreateSubscription(customer.id)}
                    size="sm"
                    style={{ backgroundColor: theme.accent }}
                    className="text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Subscription
                  </Button>
                </div>
              </div>

              {/* Subscriptions */}
              {customer.subscriptions?.data?.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white/80">
                    Subscriptions ({customer.subscriptions.data.length})
                  </h4>
                  {customer.subscriptions.data.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(subscription.status)}
                            {subscription.cancel_at_period_end && (
                              <Badge className="bg-yellow-500/20 text-yellow-400">
                                Canceling at period end
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-white">
                              <span className="font-semibold">
                                {formatPrice(
                                  subscription.items.data[0]?.price?.unit_amount || 0,
                                  subscription.currency
                                )}
                              </span>
                              {subscription.items.data[0]?.price?.recurring && (
                                <span className="text-white/60 ml-2">
                                  {formatRecurringInterval(subscription.items.data[0].price.recurring)}
                                </span>
                              )}
                            </p>
                            {subscription.current_period_start && subscription.current_period_end && (
                              <p className="text-white/60">
                                Current period: {format(new Date(subscription.current_period_start * 1000), 'MMM d, yyyy')} - {format(new Date(subscription.current_period_end * 1000), 'MMM d, yyyy')}
                              </p>
                            )}
                            <p className="text-white/40 font-mono text-xs">{subscription.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {subscription.status === 'active' && (
                            <Button
                              onClick={() => handleChangePlan(subscription)}
                              size="sm"
                              variant="outline"
                              className="border-white/10"
                            >
                              <ArrowUpDown className="w-3 h-3" />
                            </Button>
                          )}
                          {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                            <Button
                              onClick={() => handleCancelSubscription(subscription)}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40 italic">No active subscriptions</p>
              )}
            </GlassCard>
          ))
        )}
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Cancel Subscription
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  This action will cancel the customer's subscription. Choose when to cancel:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setCancelAtPeriodEnd(true)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      cancelAtPeriodEnd
                        ? 'border-white/30 bg-white/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-white font-medium">At period end</p>
                    <p className="text-sm text-white/60 mt-1">
                      Customer keeps access until {selectedSubscription.current_period_end ? format(new Date(selectedSubscription.current_period_end * 1000), 'MMM d, yyyy') : 'end of period'}
                    </p>
                  </button>
                  <button
                    onClick={() => setCancelAtPeriodEnd(false)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      !cancelAtPeriodEnd
                        ? 'border-white/30 bg-white/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-white font-medium">Immediately</p>
                    <p className="text-sm text-white/60 mt-1">
                      Customer loses access right away
                    </p>
                  </button>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                    className="border-white/10"
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    onClick={confirmCancel}
                    disabled={cancelSubscriptionMutation.isPending}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {cancelSubscriptionMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={customerDetailsOpen} onOpenChange={setCustomerDetailsOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Customer Details</DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="text-center py-8 text-white/60">Loading...</div>
          ) : customerDetails && (
            <div className="space-y-6">
              <div>
                <Label className="text-white/60">Name</Label>
                <p className="text-white">{customerDetails.customer.name || 'No name'}</p>
              </div>
              <div>
                <Label className="text-white/60">Email</Label>
                <p className="text-white">{customerDetails.customer.email || 'No email'}</p>
              </div>
              <div>
                <Label className="text-white/60">Customer ID</Label>
                <p className="text-white font-mono text-sm">{customerDetails.customer.id}</p>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div>
                <Label className="text-white/60">Payment Methods</Label>
                {customerDetails.paymentMethods?.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {customerDetails.paymentMethods.map(pm => (
                      <div key={pm.id} className="bg-white/5 p-3 rounded flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white">
                            {pm.card.brand.toUpperCase()} •••• {pm.card.last4}
                          </p>
                          <p className="text-xs text-white/40">
                            Expires {pm.card.exp_month}/{pm.card.exp_year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm mt-2">No payment methods on file</p>
                )}
              </div>

              <Separator className="bg-white/10" />

              <div>
                <Label className="text-white/60">Recent Invoices</Label>
                {customerDetails.invoices?.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {customerDetails.invoices.slice(0, 5).map(invoice => (
                      <div key={invoice.id} className="bg-white/5 p-3 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">
                              {formatPrice(invoice.amount_paid, invoice.currency)}
                            </p>
                            <p className="text-xs text-white/40">
                              {format(new Date(invoice.created * 1000), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(invoice.status)}
                            {invoice.invoice_pdf && (
                              <a 
                                href={invoice.invoice_pdf} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-white"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm mt-2">No invoices found</p>
                )}
              </div>

              <Separator className="bg-white/10" />

              <div>
                <Label className="text-white/60">Customer Metadata</Label>
                <pre className="text-white/80 text-xs bg-white/5 p-3 rounded mt-2 overflow-auto">
                  {JSON.stringify(customerDetails.customer.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Change Subscription Plan</DialogTitle>
            <DialogDescription className="text-white/70">
              Select a new price for this subscription. Changes will be prorated.
            </DialogDescription>
          </DialogHeader>
          {selectedSubForChange && (
            <div className="space-y-4">
              <div>
                <Label className="text-white/60">Current Plan</Label>
                <p className="text-white">
                  {formatPrice(
                    selectedSubForChange.items.data[0]?.price?.unit_amount || 0,
                    selectedSubForChange.currency
                  )}
                  {selectedSubForChange.items.data[0]?.price?.recurring && (
                    <span className="text-white/60 ml-2">
                      {formatRecurringInterval(selectedSubForChange.items.data[0].price.recurring)}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <Label className="text-white">New Plan</Label>
                <Select value={newPriceId} onValueChange={setNewPriceId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select a price" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPrices
                      .filter(price => price.active && price.id !== selectedSubForChange.items.data[0]?.price?.id)
                      .map(price => (
                        <SelectItem key={price.id} value={price.id}>
                          {formatPrice(price.unit_amount, price.currency)}
                          {price.recurring && ` ${formatRecurringInterval(price.recurring)}`}
                          {price.nickname && ` (${price.nickname})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setChangePlanDialogOpen(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmChangePlan}
                  disabled={!newPriceId || updateSubscriptionMutation.isPending}
                  style={{ backgroundColor: theme.accent }}
                  className="text-white"
                >
                  {updateSubscriptionMutation.isPending ? 'Updating...' : 'Change Plan'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Subscription Dialog */}
      <Dialog open={createSubDialogOpen} onOpenChange={setCreateSubDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create Manual Subscription</DialogTitle>
            <DialogDescription className="text-white/70">
              Create a new subscription for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Select Plan</Label>
              <Select value={createSubPriceId} onValueChange={setCreateSubPriceId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose a price" />
                </SelectTrigger>
                <SelectContent>
                  {allPrices
                    .filter(price => price.active)
                    .map(price => (
                      <SelectItem key={price.id} value={price.id}>
                        {formatPrice(price.unit_amount, price.currency)}
                        {price.recurring && ` ${formatRecurringInterval(price.recurring)}`}
                        {price.nickname && ` (${price.nickname})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Trial Period (days, optional)</Label>
              <Input
                type="number"
                value={createSubTrialDays}
                onChange={(e) => setCreateSubTrialDays(e.target.value)}
                placeholder="e.g., 7"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setCreateSubDialogOpen(false)}
                className="border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCreateSubscription}
                disabled={!createSubPriceId || createSubscriptionMutation.isPending}
                style={{ backgroundColor: theme.accent }}
                className="text-white"
              >
                {createSubscriptionMutation.isPending ? 'Creating...' : 'Create Subscription'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
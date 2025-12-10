import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Ticket, Tag, RefreshCw, Percent, DollarSign } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';

export default function AdminPromotions() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);

  const [couponForm, setCouponForm] = useState({
    name: '',
    percent_off: '',
    amount_off: '',
    currency: 'usd',
    duration: 'once',
    duration_in_months: ''
  });

  const [promoForm, setPromoForm] = useState({
    coupon_id: '',
    code: '',
    max_redemptions: '',
    expires_at: '',
    first_time_transaction: false,
    minimum_amount: '',
    minimum_amount_currency: 'usd'
  });

  const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useQuery({
    queryKey: ['stripe-coupons'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listCoupons');
      return data;
    }
  });

  const { data: promosData, isLoading: promosLoading, refetch: refetchPromos } = useQuery({
    queryKey: ['stripe-promos'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listPromotionCodes');
      return data;
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData) => {
      const { data } = await base44.functions.invoke('createCoupon', couponData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-coupons']);
      setCouponDialogOpen(false);
      setCouponForm({ name: '', percent_off: '', amount_off: '', currency: 'usd', duration: 'once', duration_in_months: '' });
    }
  });

  const createPromoMutation = useMutation({
    mutationFn: async (promoData) => {
      const { data } = await base44.functions.invoke('createPromotionCode', promoData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-promos']);
      setPromoDialogOpen(false);
      setPromoForm({ coupon_id: '', code: '', max_redemptions: '', expires_at: '', first_time_transaction: false, minimum_amount: '', minimum_amount_currency: 'usd' });
    }
  });

  const handleCreateCoupon = () => {
    createCouponMutation.mutate(couponForm);
  };

  const handleCreatePromo = () => {
    const promoData = { ...promoForm };
    
    if (promoForm.expires_at) {
      const expiresDate = new Date(promoForm.expires_at);
      promoData.expires_at = Math.floor(expiresDate.getTime() / 1000);
    }
    
    createPromoMutation.mutate(promoData);
  };

  const formatDiscount = (coupon) => {
    if (coupon.percent_off) {
      return `${coupon.percent_off}% off`;
    }
    if (coupon.amount_off) {
      return `$${(coupon.amount_off / 100).toFixed(2)} off`;
    }
    return 'Unknown';
  };

  const formatDuration = (coupon) => {
    if (coupon.duration === 'once') return 'One-time';
    if (coupon.duration === 'forever') return 'Forever';
    if (coupon.duration === 'repeating') {
      return `${coupon.duration_in_months} months`;
    }
    return coupon.duration;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promotions & Coupons</h2>
          <p className="text-sm text-white/60 mt-1">Manage discounts and promotional codes</p>
        </div>
        <Button onClick={() => { refetchCoupons(); refetchPromos(); }} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="bg-white/5">
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="promos">Promotion Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: theme.accent }} className="text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Coupon</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Coupon Name (optional)</Label>
                    <Input
                      value={couponForm.name}
                      onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                      placeholder="Summer Sale"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Discount Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/60 text-xs">Percent Off</Label>
                        <Input
                          type="number"
                          value={couponForm.percent_off}
                          onChange={(e) => setCouponForm({ ...couponForm, percent_off: e.target.value, amount_off: '' })}
                          placeholder="50"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Amount Off ($)</Label>
                        <Input
                          type="number"
                          value={couponForm.amount_off}
                          onChange={(e) => setCouponForm({ ...couponForm, amount_off: e.target.value, percent_off: '' })}
                          placeholder="10.00"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Duration</Label>
                    <Select 
                      value={couponForm.duration}
                      onValueChange={(value) => setCouponForm({ ...couponForm, duration: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">One-time</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                        <SelectItem value="repeating">Repeating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {couponForm.duration === 'repeating' && (
                    <div>
                      <Label className="text-white">Duration (Months)</Label>
                      <Input
                        type="number"
                        value={couponForm.duration_in_months}
                        onChange={(e) => setCouponForm({ ...couponForm, duration_in_months: e.target.value })}
                        placeholder="3"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  )}
                  <Button 
                    onClick={handleCreateCoupon}
                    disabled={(!couponForm.percent_off && !couponForm.amount_off) || createCouponMutation.isPending}
                    style={{ backgroundColor: theme.accent }}
                    className="w-full text-white"
                  >
                    {createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {couponsLoading ? (
            <div className="text-center py-8 text-white/60">Loading coupons...</div>
          ) : (
            <div className="grid gap-4">
              {couponsData?.coupons?.map((coupon) => (
                <GlassCard key={coupon.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-white/60 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {coupon.name || coupon.id}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                            {formatDiscount(coupon)}
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-white/60">
                            {formatDuration(coupon)}
                          </Badge>
                          {coupon.valid && (
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/40 font-mono mt-2">{coupon.id}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
              {couponsData?.coupons?.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/40">No coupons yet. Create your first coupon.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="promos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: theme.accent }} className="text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Promo Code
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Promotion Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Select Coupon</Label>
                    <Select 
                      value={promoForm.coupon_id}
                      onValueChange={(value) => setPromoForm({ ...promoForm, coupon_id: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Choose a coupon" />
                      </SelectTrigger>
                      <SelectContent>
                        {couponsData?.coupons?.map((coupon) => (
                          <SelectItem key={coupon.id} value={coupon.id}>
                            {coupon.name || coupon.id} - {formatDiscount(coupon)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Promo Code</Label>
                    <Input
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                      placeholder="LAUNCH50"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Redemptions (optional)</Label>
                    <Input
                      type="number"
                      value={promoForm.max_redemptions}
                      onChange={(e) => setPromoForm({ ...promoForm, max_redemptions: e.target.value })}
                      placeholder="100"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Expires At (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={promoForm.expires_at}
                      onChange={(e) => setPromoForm({ ...promoForm, expires_at: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Minimum Amount (cents, optional)</Label>
                    <Input
                      type="number"
                      value={promoForm.minimum_amount}
                      onChange={(e) => setPromoForm({ ...promoForm, minimum_amount: e.target.value })}
                      placeholder="1000"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={promoForm.first_time_transaction}
                      onChange={(e) => setPromoForm({ ...promoForm, first_time_transaction: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label className="text-white">First-time customers only</Label>
                  </div>
                  <Button 
                    onClick={handleCreatePromo}
                    disabled={!promoForm.coupon_id || !promoForm.code || createPromoMutation.isPending}
                    style={{ backgroundColor: theme.accent }}
                    className="w-full text-white"
                  >
                    {createPromoMutation.isPending ? 'Creating...' : 'Create Promo Code'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {promosLoading ? (
            <div className="text-center py-8 text-white/60">Loading promotion codes...</div>
          ) : (
            <div className="grid gap-4">
              {promosData?.promotionCodes?.map((promo) => (
                <GlassCard key={promo.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-white/60 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white font-mono">
                          {promo.code}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                            {formatDiscount(promo.coupon)}
                          </Badge>
                          {promo.active && (
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          )}
                          {promo.times_redeemed > 0 && (
                            <Badge variant="outline" className="border-white/20 text-white/60">
                              Used {promo.times_redeemed} times
                            </Badge>
                          )}
                        </div>
                        {promo.restrictions?.first_time_transaction && (
                          <p className="text-xs text-white/60 mt-2">New customers only</p>
                        )}
                        {promo.restrictions?.minimum_amount && (
                          <p className="text-xs text-white/60">
                            Min: ${(promo.restrictions.minimum_amount / 100).toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-white/40 font-mono mt-2">{promo.id}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
              {promosData?.promotionCodes?.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/40">No promo codes yet. Create your first promo code.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
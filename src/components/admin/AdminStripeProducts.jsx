import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, DollarSign, Package, RefreshCw, Eye, Edit, Archive, Trash2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';
import GlassCard from '@/components/theme/GlassCard';
import MetadataEditor from './MetadataEditor';

export default function AdminStripeProducts() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [viewProductDialogOpen, setViewProductDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewProductData, setViewProductData] = useState(null);
  const [editProductData, setEditProductData] = useState(null);
  const [archiveProductData, setArchiveProductData] = useState(null);

  const [productForm, setProductForm] = useState({ name: '', description: '', images: [], metadata: {}, tax_code: '' });
  const [priceForm, setPriceForm] = useState({ amount: '', currency: 'usd', interval: 'month', interval_count: 1, metadata: {}, nickname: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', images: [], active: true, metadata: {}, tax_code: '' });
  const [editPriceDialogOpen, setEditPriceDialogOpen] = useState(false);
  const [editPriceData, setEditPriceData] = useState(null);
  const [editPriceForm, setEditPriceForm] = useState({ metadata: {}, nickname: '' });
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [deletePriceDialogOpen, setDeletePriceDialogOpen] = useState(false);
  const [deleteProductData, setDeleteProductData] = useState(null);
  const [deletePriceData, setDeletePriceData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('listStripeProducts');
      return data;
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const { data } = await base44.functions.invoke('createStripeProduct', productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-products']);
      setProductDialogOpen(false);
      setProductForm({ name: '', description: '', images: [], metadata: {}, tax_code: '' });
    }
  });

  const createPriceMutation = useMutation({
    mutationFn: async (priceData) => {
      const { data } = await base44.functions.invoke('createStripePrice', priceData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-products']);
      setPriceDialogOpen(false);
      setPriceForm({ amount: '', currency: 'usd', interval: 'month', interval_count: 1, metadata: {}, nickname: '' });
      setSelectedProduct(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }) => {
      const { data: result } = await base44.functions.invoke('updateStripeProduct', { productId, ...data });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-products']);
      setEditProductDialogOpen(false);
      setArchiveDialogOpen(false);
      setEditProductData(null);
      setArchiveProductData(null);
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ priceId, data }) => {
      const { data: result } = await base44.functions.invoke('updateStripePrice', { priceId, ...data });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-products']);
      setEditPriceDialogOpen(false);
      setEditPriceData(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const { data } = await base44.functions.invoke('deleteStripeProduct', { productId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-products']);
      setDeleteProductDialogOpen(false);
      setDeleteProductData(null);
    }
  });

  const deletePriceMutation = useMutation({
    mutationFn: async (priceId) => {
      const { data } = await base44.functions.invoke('deleteStripePrice', { priceId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stripe-products']);
      setDeletePriceDialogOpen(false);
      setDeletePriceData(null);
    }
  });

  const handleCreateProduct = () => {
    createProductMutation.mutate(productForm);
  };

  const handleCreatePrice = () => {
    if (!selectedProduct) return;
    createPriceMutation.mutate({
      productId: selectedProduct,
      amount: parseInt(priceForm.amount) * 100,
      currency: priceForm.currency,
      interval: priceForm.interval,
      interval_count: parseInt(priceForm.interval_count) || 1,
      metadata: priceForm.metadata,
      nickname: priceForm.nickname
    });
  };

  const handleViewProduct = (product, prices) => {
    setViewProductData({ product, prices });
    setViewProductDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditProductData(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      images: product.images || [],
      active: product.active,
      metadata: product.metadata || {},
      tax_code: product.tax_code || ''
    });
    setEditProductDialogOpen(true);
  };

  const handleEditPrice = (price) => {
    setEditPriceData(price);
    setEditPriceForm({
      metadata: price.metadata || {},
      nickname: price.nickname || ''
    });
    setEditPriceDialogOpen(true);
  };

  const handleUpdatePrice = () => {
    if (!editPriceData) return;
    updatePriceMutation.mutate({
      priceId: editPriceData.id,
      data: editPriceForm
    });
  };

  const handleDeleteProduct = (product) => {
    setDeleteProductData(product);
    setDeleteProductDialogOpen(true);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deleteProductData) return;
    deleteProductMutation.mutate(deleteProductData.id);
  };

  const handleDeletePrice = (price) => {
    setDeletePriceData(price);
    setDeletePriceDialogOpen(true);
  };

  const handleConfirmDeletePrice = () => {
    if (!deletePriceData) return;
    deletePriceMutation.mutate(deletePriceData.id);
  };

  const handleImageUpload = async (file, isEditMode = false) => {
    setUploadingImage(true);
    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      const imageUrl = data.file_url;
      
      if (isEditMode) {
        setEditForm(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      } else {
        setProductForm(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index, isEditMode = false) => {
    if (isEditMode) {
      setEditForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleArchiveProduct = (product) => {
    setArchiveProductData(product);
    setArchiveDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editProductData) return;
    updateProductMutation.mutate({
      productId: editProductData.id,
      data: editForm
    });
  };

  const handleConfirmArchive = () => {
    if (!archiveProductData) return;
    updateProductMutation.mutate({
      productId: archiveProductData.id,
      data: { active: !archiveProductData.active }
    });
  };

  const handleTogglePrice = (price) => {
    updatePriceMutation.mutate({
      priceId: price.id,
      data: { active: !price.active }
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

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stripe Products & Pricing</h2>
          <p className="text-sm text-white/60 mt-1">Manage your subscription products and pricing tiers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: theme.accent }} className="text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Product Name</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g., Premium Plan"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe the product..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Product Images</Label>
                  <div className="space-y-2">
                    {productForm.images?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {productForm.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt="Product" className="w-full h-24 object-cover rounded" />
                            <button
                              onClick={() => handleRemoveImage(idx, false)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('product-image-upload').click()}
                      disabled={uploadingImage}
                      className="w-full border-white/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input
                      id="product-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], false)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Tax Code (optional)</Label>
                  <Input
                    value={productForm.tax_code}
                    onChange={(e) => setProductForm({ ...productForm, tax_code: e.target.value })}
                    placeholder="e.g., txcd_10000000"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <MetadataEditor
                  metadata={productForm.metadata}
                  onChange={(metadata) => setProductForm({ ...productForm, metadata })}
                />
                <Button 
                  onClick={handleCreateProduct}
                  disabled={!productForm.name || createProductMutation.isPending}
                  style={{ backgroundColor: theme.accent }}
                  className="w-full text-white"
                >
                  {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products List */}
      <div className="grid gap-4">
        {productsData?.products?.map(({ product, prices }) => (
          <GlassCard key={product.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5" style={{ color: theme.accent }} />
                  <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                  {!product.active && (
                    <Badge variant="outline" className="border-red-500/50 text-red-400">
                      Archived
                    </Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-sm text-white/60 mb-2">{product.description}</p>
                )}
                <p className="text-xs text-white/40 font-mono">ID: {product.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewProduct(product, prices)}
                  size="sm"
                  variant="outline"
                  className="border-white/10"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleEditProduct(product)}
                  size="sm"
                  variant="outline"
                  className="border-white/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleArchiveProduct(product)}
                  size="sm"
                  variant="outline"
                  className="border-white/10"
                >
                  {product.active ? <Archive className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => handleDeleteProduct(product)}
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Dialog 
                  open={priceDialogOpen && selectedProduct === product.id} 
                  onOpenChange={(open) => {
                    setPriceDialogOpen(open);
                    if (!open) setSelectedProduct(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setSelectedProduct(product.id)}
                      size="sm" 
                      style={{ backgroundColor: theme.accent }}
                      className="text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Price
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Price to {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Price Amount (in dollars)</Label>
                        <Input
                          type="number"
                          value={priceForm.amount}
                          onChange={(e) => setPriceForm({ ...priceForm, amount: e.target.value })}
                          placeholder="29.99"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Currency</Label>
                        <Select 
                          value={priceForm.currency}
                          onValueChange={(value) => setPriceForm({ ...priceForm, currency: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="gbp">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Billing Interval</Label>
                        <Select 
                          value={priceForm.interval}
                          onValueChange={(value) => setPriceForm({ ...priceForm, interval: value })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Daily</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="month">Monthly</SelectItem>
                            <SelectItem value="year">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Interval Count</Label>
                        <Input
                          type="number"
                          min="1"
                          value={priceForm.interval_count}
                          onChange={(e) => setPriceForm({ ...priceForm, interval_count: e.target.value })}
                          placeholder="1"
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <p className="text-xs text-white/40 mt-1">
                          Tip: 2 weeks = bi-weekly, 3 months = quarterly
                        </p>
                      </div>
                      <div>
                        <Label className="text-white">Nickname (optional)</Label>
                        <Input
                          value={priceForm.nickname}
                          onChange={(e) => setPriceForm({ ...priceForm, nickname: e.target.value })}
                          placeholder="e.g., Standard Monthly"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <MetadataEditor
                        metadata={priceForm.metadata}
                        onChange={(metadata) => setPriceForm({ ...priceForm, metadata })}
                      />
                      <Button 
                        onClick={handleCreatePrice}
                        disabled={!priceForm.amount || createPriceMutation.isPending}
                        style={{ backgroundColor: theme.accent }}
                        className="w-full text-white"
                      >
                        {createPriceMutation.isPending ? 'Creating...' : 'Create Price'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Prices */}
            {prices.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/80 mb-2">Pricing Options:</h4>
                {prices.map((price) => (
                  <div 
                    key={price.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-white/60" />
                      <div>
                        <p className="font-semibold text-white">
                          {formatPrice(price.unit_amount, price.currency)}
                          {price.recurring && (
                            <span className="text-sm text-white/60 ml-2">
                              {formatRecurringInterval(price.recurring)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/40 font-mono">{price.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPrice(price)}
                        className="hover:bg-white/5"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePrice(price)}
                        className={price.active ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}
                      >
                        {price.active ? (
                          <span className="text-xs px-2 py-1 rounded bg-green-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-red-500/20">
                            Inactive
                          </span>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePrice(price)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 italic">No prices created yet</p>
            )}
          </GlassCard>
        ))}
      </div>

      {productsData?.products?.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/40">No products yet. Create your first product to get started.</p>
        </div>
      )}

      {/* View Product Dialog */}
      <Dialog open={viewProductDialogOpen} onOpenChange={setViewProductDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Product Details</DialogTitle>
          </DialogHeader>
          {viewProductData && (
            <div className="space-y-4">
              <div>
                <Label className="text-white/60">Name</Label>
                <p className="text-white text-lg">{viewProductData.product.name}</p>
              </div>
              <div>
                <Label className="text-white/60">Description</Label>
                <p className="text-white">{viewProductData.product.description || 'No description'}</p>
              </div>
              <div>
                <Label className="text-white/60">Product ID</Label>
                <p className="text-white font-mono text-sm">{viewProductData.product.id}</p>
              </div>
              <div>
                <Label className="text-white/60">Status</Label>
                <Badge className={viewProductData.product.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {viewProductData.product.active ? 'Active' : 'Archived'}
                </Badge>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <Label className="text-white/60">Metadata</Label>
                <pre className="text-white/80 text-xs bg-white/5 p-3 rounded mt-2 overflow-auto">
                  {JSON.stringify(viewProductData.product.metadata, null, 2)}
                </pre>
              </div>
              <div>
                <Label className="text-white/60">Prices ({viewProductData.prices.length})</Label>
                <div className="space-y-2 mt-2">
                  {viewProductData.prices.map(price => (
                    <div key={price.id} className="bg-white/5 p-3 rounded">
                      <p className="text-white font-semibold">
                        {formatPrice(price.unit_amount, price.currency)}
                        {price.recurring && <span className="text-white/60 ml-2">{formatRecurringInterval(price.recurring)}</span>}
                      </p>
                      <p className="text-white/40 text-xs font-mono">{price.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Product</DialogTitle>
          </DialogHeader>
          {editProductData && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Product Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Product Images</Label>
                <div className="space-y-2">
                  {editForm.images?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {editForm.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="Product" className="w-full h-24 object-cover rounded" />
                          <button
                            onClick={() => handleRemoveImage(idx, true)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('edit-product-image-upload').click()}
                    disabled={uploadingImage}
                    className="w-full border-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <input
                    id="edit-product-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Tax Code (optional)</Label>
                <Input
                  value={editForm.tax_code}
                  onChange={(e) => setEditForm({ ...editForm, tax_code: e.target.value })}
                  placeholder="e.g., txcd_10000000"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <MetadataEditor
                metadata={editForm.metadata}
                onChange={(metadata) => setEditForm({ ...editForm, metadata })}
              />
              <Button 
                onClick={handleUpdateProduct}
                disabled={!editForm.name || updateProductMutation.isPending}
                style={{ backgroundColor: theme.accent }}
                className="w-full text-white"
              >
                {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          {archiveProductData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  {archiveProductData.active ? 'Archive Product?' : 'Reactivate Product?'}
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  {archiveProductData.active 
                    ? 'Archiving this product will make it unavailable for new purchases. Existing subscriptions will continue.'
                    : 'Reactivating this product will make it available for new purchases again.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setArchiveDialogOpen(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmArchive}
                  disabled={updateProductMutation.isPending}
                  style={{ backgroundColor: archiveProductData.active ? theme.accent : '#22c55e' }}
                  className="text-white"
                >
                  {updateProductMutation.isPending ? 'Processing...' : (archiveProductData.active ? 'Archive' : 'Reactivate')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={editPriceDialogOpen} onOpenChange={setEditPriceDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Price</DialogTitle>
          </DialogHeader>
          {editPriceData && (
            <div className="space-y-4">
              <div>
                <Label className="text-white/60">Price Amount</Label>
                <p className="text-white text-lg">{formatPrice(editPriceData.unit_amount, editPriceData.currency)}</p>
                <p className="text-xs text-white/40 mt-1">Price amount cannot be changed. Create a new price instead.</p>
              </div>
              <div>
                <Label className="text-white">Nickname (optional)</Label>
                <Input
                  value={editPriceForm.nickname}
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, nickname: e.target.value })}
                  placeholder="e.g., Standard Monthly"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <MetadataEditor
                metadata={editPriceForm.metadata}
                onChange={(metadata) => setEditPriceForm({ ...editPriceForm, metadata })}
              />
              <Button 
                onClick={handleUpdatePrice}
                disabled={updatePriceMutation.isPending}
                style={{ backgroundColor: theme.accent }}
                className="w-full text-white"
              >
                {updatePriceMutation.isPending ? 'Updating...' : 'Update Price'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={deleteProductDialogOpen} onOpenChange={setDeleteProductDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          {deleteProductData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Delete Product?
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  <strong className="text-red-400">Warning:</strong> Deleting this product is permanent and cannot be undone. 
                  Stripe recommends archiving instead of deleting to maintain historical data and existing subscriptions.
                  <br/><br/>
                  Are you absolutely sure you want to delete <strong>{deleteProductData.name}</strong>?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setDeleteProductDialogOpen(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmDeleteProduct}
                  disabled={deleteProductMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Price Confirmation Dialog */}
      <Dialog open={deletePriceDialogOpen} onOpenChange={setDeletePriceDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10">
          {deletePriceData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Delete Price?
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  <strong className="text-red-400">Warning:</strong> Deleting this price is permanent. 
                  Stripe recommends deactivating instead of deleting to maintain historical data.
                  <br/><br/>
                  Are you sure you want to delete the price <strong>{formatPrice(deletePriceData.unit_amount, deletePriceData.currency)}</strong>?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setDeletePriceDialogOpen(false)}
                  className="border-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmDeletePrice}
                  disabled={deletePriceMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deletePriceMutation.isPending ? 'Deleting...' : 'Delete Price'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
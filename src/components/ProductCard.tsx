'use client'
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cartStore';
import { useWishlist } from '@/lib/wishlistStore';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, ids: wishlistIds } = useWishlist();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        image: product.image || product.images?.[0] || '/placeholder-product.jpg',
        price: product.price.discounted || product.price.original,
        qty: 1
      };
      await addToCart(cartItem);
      toast({
        title: "कार्ट में जोड़ा गया",
        description: `${product.name} कार्ट में जोड़ दिया गया है।`,
      });
    } catch (error) {
      toast({
        title: "त्रुटि",
        description: "कार्ट में जोड़ने में समस्या हुई।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const wishlistState = useWishlist.getState();
      const wasInWishlist = wishlistState.ids.includes(product.id);
      await toggleWishlist(product.id);
      toast({
        title: wasInWishlist ? "विशलिस्ट से हटाया गया" : "विशलिस्ट में जोड़ा गया",
        description: `${product.name} ${wasInWishlist ? 'विशलिस्ट से हटा दिया गया' : 'विशलिस्ट में जोड़ दिया गया'} है।`,
      });
    } catch (error) {
      toast({
        title: "त्रुटि",
        description: "विशलिस्ट अपडेट करने में समस्या हुई।",
      });
    }
  };

  const discountPercentage = product.price.original && product.price.discounted
    ? Math.round(((product.price.original - product.price.discounted) / product.price.original) * 100)
    : 0;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-0 shadow-md">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-2 py-1 rounded-full text-xs">
          {discountPercentage}% OFF
        </Badge>
      )}

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-sm transition-all duration-200"
        onClick={handleToggleWishlist}
      >
        <Heart 
          className={`h-4 w-4 transition-colors ${wishlistIds.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-400'}`} 
        />
      </Button>

      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&auto=format&fit=crop'}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&auto=format&fit=crop';
            }}
          />
          
          {/* Quick View Overlay */}
          {onQuickView && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100 flex items-end justify-center pb-4">
              <Button
                variant="secondary"
                onClick={() => onQuickView(product)}
                className="bg-white/95 text-black hover:bg-white font-medium px-6 py-2 rounded-full shadow-lg backdrop-blur-sm"
              >
                Quick View
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-base line-clamp-2 text-gray-900 leading-tight">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-sm text-gray-500 mt-1 font-medium">{product.brand}</p>
            )}
          </div>

          {/* Rating */}
          {product.ratings && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.ratings!.average) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {product.ratings.average} ({product.ratings.count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-xl text-gray-900">
              ₹{(product.price.discounted || product.price.original).toLocaleString()}
            </span>
            {product.price.discounted && product.price.original > product.price.discounted && (
              <span className="text-base text-gray-500 line-through">
                ₹{product.price.original.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {product.quantity > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 font-medium">
                ✓ In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600 bg-red-50 font-medium">
                ✗ Out of Stock
              </Badge>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || product.quantity === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;

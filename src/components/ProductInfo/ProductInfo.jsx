import { useState, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { Box, Typography, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Rating } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getProduct, getProductVariants, getProductImages } from '../../services/catalogApi';
import { adaptProduct, adaptImage, adaptVariant, variantChoiceLabel } from '../../services/catalogAdapter';
import { findInventoryForItem } from '../../services/inventoryApi';
import { loadProductStock } from '../../utils/productStock.js';
import { resolveProductStore } from '../../services/productStoreResolver';
import SafeProductImage from '../SafeProductImage/SafeProductImage';
import './ProductInfo.css';

const validWebUrl = (value) => { try { const parsed = new URL(value); return ['http:','https:'].includes(parsed.protocol) ? parsed.href : ''; } catch { return ''; } };
const youtubeEmbedUrl = (url) => { const safe=validWebUrl(url);if(!safe)return '';const parsed=new URL(safe);const id=parsed.hostname.includes('youtu.be')?parsed.pathname.slice(1):parsed.searchParams.get('v')||(parsed.pathname.includes('/embed/')?parsed.pathname.split('/embed/')[1]:'');return id?`https://www.youtube.com/embed/${encodeURIComponent(id)}`:safe; };
const responseItems = (payload) => Array.isArray(payload) ? payload : payload?.content || payload?.items || payload?.data || payload?.variants || payload?.images || [];

const ProductInfo = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const scrollRef = useRef(null);
  const { selectedProduct, addToCart, updateQuantity, openCart, cartCount, cartItems, isLoggedIn, formatCurrency, catalogProducts, sameCatalogItem, cartLoading, cartError } = useContext(AppContext);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageFallbackSrc, setImageFallbackSrc] = useState('');
  const [activeLink, setActiveLink] = useState(null);
  const targetId = productId || selectedProduct?.productId || selectedProduct?.id || selectedProduct?.sku;
  const [productResult, setProductResult] = useState(null);
  const [variantResult, setVariantResult] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [selectionScope, setSelectionScope] = useState(targetId);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  if (selectionScope !== targetId) {
    setSelectionScope(targetId);
    setImageIndex(0);
    setActiveLink(null);
    setSelectedVariantId('');
  }
  const currentProductResult = productResult?.targetId === targetId ? productResult : null;
  const currentVariantResult = variantResult?.targetId === targetId ? variantResult : null;
  const currentImageResult = imageResult?.targetId === targetId ? imageResult : null;
  const catalogProduct = currentProductResult?.product;
  const productLoading = Boolean(targetId && !currentProductResult);
  const variantsLoading = Boolean(targetId && !currentVariantResult);
  const imagesLoading = Boolean(targetId && !currentImageResult);
  const productError = currentProductResult?.error;

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [targetId, location.key]);

  useEffect(() => {
    if (!targetId) return;
    let ignore = false;
    getProduct(targetId).then((response) => {
      if (ignore) return;
      if (!response?.id && !response?.productId) throw new Error('Product unavailable.');
      setProductResult({ targetId, product: adaptProduct(response) });
    }).catch((error) => {
      if (!ignore) setProductResult({ targetId, error: error.message || 'The product could not be loaded.' });
    });
    getProductVariants(targetId).then((response) => {
      if (!ignore) setVariantResult({ targetId, variants: responseItems(response).map((item) => adaptVariant(item, { productId: targetId })) });
    }).catch((error) => {
      if (!ignore) setVariantResult({ targetId, error: error.message || 'Variants could not be loaded.' });
    });
    getProductImages(targetId).then((response) => {
      if (!ignore) {
        const images = responseItems(response).map((item) => adaptImage(item, targetId)).filter((image) => image.url).sort((a, b) => a.displayOrder - b.displayOrder);
        setImageResult({ targetId, images });
      }
    }).catch((error) => {
      if (!ignore) setImageResult({ targetId, error: error.message || 'Product images could not be loaded.' });
    });
    return () => { ignore = true; };
  }, [targetId]);

  const navigationProduct = location.state?.product || selectedProduct;
  const storeSource = navigationProduct?.productId === targetId || navigationProduct?.id === targetId ? navigationProduct : {};
  const store = resolveProductStore({ ...catalogProduct, ...(storeSource.storeId ? { storeId: storeSource.storeId, storeName: storeSource.storeName, store: storeSource.store } : {}) }, catalogProducts);
  const actualVariants = currentVariantResult && !currentVariantResult.error ? currentVariantResult.variants : catalogProduct?.catalogVariants || [];
  const apiImages = currentImageResult && !currentImageResult.error ? currentImageResult.images : null;
  const imageList = apiImages?.length ? apiImages.map((image) => image.url) : catalogProduct?.gallery || [];
  const primaryApiImage = apiImages?.find((image) => image.primaryImage)?.url;
  const product = catalogProduct ? {
    ...catalogProduct,
    ...store,
    variants: actualVariants,
    gallery: imageList,
    image: primaryApiImage || (apiImages?.length ? imageList[0] : catalogProduct.image || imageList[0]),
  } : {
    title: productLoading ? 'Loading product' : 'Product unavailable',
    subtitle: productError || 'Catalog product details are not available.',
    description: '',
    image: '',
    variants: [],
  };
  const variantOptions = (Array.isArray(product.variants) ? product.variants : []).map((variant) => ({ ...variant, label: variantChoiceLabel(variant) || variant.label || variant.name || '' })).filter((variant) => variant.label);
  const effectiveVariantId = variantOptions.some((variant) => (variant.variantId || variant.id) === selectedVariantId) ? selectedVariantId : variantOptions[0]?.variantId || variantOptions[0]?.id || '';
  const selectedVariant = variantOptions.find((variant) => (variant.variantId || variant.id) === effectiveVariantId) || variantOptions[0];
  const productPriceKnown = selectedVariant ? selectedVariant.priceKnown !== false : product.priceKnown !== false;
  const variantDataUnknown = actualVariants.length === 0 && !catalogProduct?.catalogVariantsKnown && (!currentVariantResult || currentVariantResult.error);
  const variantsUnavailable = variantDataUnknown || (actualVariants.length > 0 && (!variantOptions.length || variantOptions.every((variant) => !variant.variantId && !variant.id)));
  const selectedWeight = selectedVariant?.label || selectedVariant?.weight || product.weight || '';
  const [stockResult, setStockResult] = useState(null);
  const stockVariantId = selectedVariant?.variantId ?? selectedVariant?.id ?? null;
  const stockScope = `${product.storeId}:${product.productId}:${stockVariantId}`;
  useEffect(() => {
    if (!product.storeId || !product.productId) return;
    let ignore = false;
    loadProductStock(findInventoryForItem, { storeId: product.storeId, productId: product.productId, variantId: stockVariantId })
      .then(stock => { if (!ignore) setStockResult({ scope: stockScope, ...stock }); });
    return () => { ignore = true; };
  }, [product.storeId, product.productId, stockVariantId, stockScope]);
  const stock = stockResult?.scope === stockScope ? stockResult : null;
  const checkingStock = Boolean(product.storeId && catalogProduct && !stock);

  const bestSellers = catalogProducts.filter((item) => item.productId !== targetId).slice(0, 3);
  const productImages = [product.image, ...(product.gallery || [])].filter((image, index, values) => image && values.indexOf(image) === index);
  const selectedImageIndex = Math.min(imageIndex, Math.max(0, productImages.length - 1));
  const externalLinks = [
    { label: 'Website', url: product.websiteUrl },
    { label: 'YouTube', url: product.youtubeUrl },
    { label: 'Instagram', url: product.instagramUrl },
    { label: 'Facebook', url: product.facebookUrl },
    { label: 'Telegram', url: product.telegramUrl },
  ].map((link) => ({ ...link,url:validWebUrl(link.url) })).filter((link) => link.url);
  const productVideos = [product.videoUrl, ...String(product.videoUrls || '').split('\n')].map(validWebUrl).filter((url,index,items) => url && items.indexOf(url) === index);
  const specifications = String(product.specifications || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const tags = (Array.isArray(product.tags) ? product.tags : String(product.tags || '').split(',')).map((tag) => String(tag).trim()).filter(Boolean);
  const approvedRatings = (Array.isArray(product.reviews) ? product.reviews : []).filter((review) => review.status === 'Approved' && review.active !== false);
  const averageRating = approvedRatings.length
    ? approvedRatings.reduce((sum,review) => sum + Number(review.rating || 0),0) / approvedRatings.length
    : Number(product.averageRating ?? product.rating ?? 0);

  const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cartItem = cartItems.find((item) => sameCatalogItem(item, { productId: product.productId, variantId: selectedVariant?.variantId || selectedVariant?.id, storeId: product.storeId }));
  const productQuantity = cartItem ? cartItem.quantity : 0;
  const insufficientStock = stock?.state === 'available' && productQuantity >= stock.available;
  const isOutOfStock = stock?.state === 'out' || product.available === false || product.active === false || selectedVariant?.active === false || variantsUnavailable || insufficientStock;

  const handleViewCart = () => {
    if (isLoggedIn) {
      navigate('/cart');
    } else {
      openCart();
    }
  };

  const handleAddProduct = () => {
    if (!catalogProduct || productLoading || cartLoading || checkingStock || isOutOfStock || !productPriceKnown) return;
    addToCart({
      ...product,
      productId: product.productId || product.id,
      variantId: selectedVariant?.variantId ?? selectedVariant?.id ?? null,
      selectedVariant,
      title: product.title,
      weight: selectedWeight,
      variantSku: selectedVariant?.sku,
      price: Number(selectedVariant?.price ?? product.price ?? 0),
      unitPrice: Number(selectedVariant?.price ?? product.price ?? 0),
      image: product.image,
    });
  };

  return (
    <Box className="product-info-wrapper">
      {/* Top Header Bar */}
      <Box className="product-info-header">
        <IconButton onClick={() => navigate(-1)} className="header-back-btn">
          <ArrowBackIcon style={{ color: '#ffffff' }} />
        </IconButton>
      </Box>

      {/* Content Scroll View */}
      <Box className="product-info-scroll" ref={scrollRef} aria-busy={productLoading}>
        {cartError && <Typography role="alert" color="error">{cartError}</Typography>}
        {productError && <Typography role="alert" color="error">Product details could not be loaded: {productError}</Typography>}
        {/* Main Product Image Banner */}
        <Box className="product-banner-wrap">
          {productImages.length > 0 && <SafeProductImage src={productImages[selectedImageIndex]} alt={`${product.title} view ${selectedImageIndex + 1}`} className="product-main-img" onFallback={setImageFallbackSrc} />}
          {!productImages.length && <Box className="product-main-img product-main-img-empty">No image specified</Box>}
          <Typography className="product-image-status" aria-live="polite">{imageFallbackSrc === productImages[selectedImageIndex] ? 'This image could not be loaded; showing a fallback.' : imagesLoading ? 'Loading product images...' : currentImageResult?.error ? 'Product images could not be loaded; showing the available fallback.' : !imageList.length ? 'No product images are available.' : ''}</Typography>
          <Box className="carousel-dots">
            {productImages.map((_, index) => <button type="button" aria-label={`View image ${index + 1}`} key={index} className={`dot ${selectedImageIndex === index ? 'active' : ''}`} onClick={() => setImageIndex(index)} />)}
          </Box>
        </Box>

        {/* Product Details Section */}
        <Box className="product-details-content">
          <Typography className="product-info-title">{product.title}</Typography>
          <Typography className="product-info-subtitle">
            {product.subtitle || 'Not specified'}
          </Typography>

          {/* Weight Selectors */}
          <Box className="weight-options-row">
            <ScaleOutlinedIcon style={{ color: '#64748b', fontSize: 20 }} />
            {variantOptions.map((variant, idx) => (
              <Button
                key={variant.variantId || variant.id || `${variant.label}-${idx}`}
                className={`weight-chip ${selectedWeight === variant.label ? 'selected' : ''}`}
                onClick={() => setSelectedVariantId(variant.variantId || variant.id)}
                disabled={variant.active === false || (!variant.variantId && !variant.id)}
              >
                {variant.label}{Number(variant.price) !== Number(product.price) ? ` · ${formatCurrency(variant.price)}` : ''}
              </Button>
            ))}
            {variantsLoading && !variantOptions.length && <Typography variant="body2">Loading product options…</Typography>}
            {!variantsLoading && !currentVariantResult?.error && !variantOptions.length && <Typography variant="body2">{actualVariants.length ? 'Variant options are unavailable.' : 'No product variants available.'}</Typography>}
            {currentVariantResult?.error && <Typography role="status" variant="body2">Variant options could not be loaded{variantOptions.length ? '; showing product options.' : '.'}</Typography>}
          </Box>

          {/* Description */}
          <Typography className="product-description-text">
            {product.description || 'Not specified'}
          </Typography>
          <Box className={`availability-status ${isOutOfStock ? 'out' : ''}`}><Typography>{productLoading || checkingStock ? 'Checking stock...' : stock?.state === 'available' && insufficientStock ? `Only ${stock.available} available` : stock?.state === 'available' ? `In stock${Number.isInteger(stock.available) ? ` (${stock.available})` : ''}` : stock?.state === 'out' || product.active === false || product.available === false || selectedVariant?.active === false ? 'Unavailable' : variantsUnavailable ? 'Variant options unavailable' : 'Stock status unknown'}</Typography></Box>

          <Box className="info-block"><Typography className="info-block-heading">Ingredients</Typography><Typography>{product.ingredients || 'Not specified'}</Typography></Box>
          <Box className="info-block"><Typography className="info-block-heading">Specifications</Typography>{specifications.length ? <Box className="specification-list">{specifications.map((specification) => { const [label,...value]=specification.split(':');return <Box key={specification}><Typography>{label}</Typography><Typography>{value.join(':').trim() || '-'}</Typography></Box>; })}</Box> : <Typography>Not specified</Typography>}</Box>
          <Box className="info-block"><Typography className="info-block-heading">Tags</Typography>{tags.length ? <Box className="tag-list">{tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}</Box> : <Typography>Not specified</Typography>}</Box>
          {(productVideos.length > 0 || externalLinks.length > 0) && <Box className="info-block"><Typography className="info-block-heading">Product Media & Links</Typography><Box className="product-video-grid">{productVideos.map((url) => url.includes('youtu') ? <iframe key={url} title={`${product.title} video`} src={youtubeEmbedUrl(url)} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video key={url} controls src={url} />)}</Box><Box className="media-link-list">{externalLinks.map((link) => <Box key={link.label} className="media-link-row"><Typography>{link.label}</Typography><Box><Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => setActiveLink(link)}>Open here</Button><Button size="small" startIcon={<LaunchOutlinedIcon />} onClick={() => window.open(link.url,'_blank','noopener,noreferrer')}>External</Button></Box></Box>)}</Box></Box>}
          <Button variant="outlined" onClick={() => navigate('/reviews')} sx={{ justifyContent:'flex-start',gap:1,textTransform:'none' }}><Rating readOnly size="small" precision={0.1} value={averageRating} /> {averageRating ? `${averageRating.toFixed(1)} · ${Number(product.reviewCount ?? approvedRatings.length)} reviews` : 'No approved reviews yet'}</Button>

          {/* Highlights */}
          <Box className="info-block">
            <Typography className="info-block-heading">Highlights:</Typography>
            <ul className="highlights-list">
              {(
                product.highlights?.length ? product.highlights : ['Not specified']
              ).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </Box>

          {/* About the Source */}
          <Box className="info-block">
            <Typography className="info-block-heading">About the Source</Typography>
            <Typography className="about-source-text">
              {product.aboutSource || 'Not specified'}
            </Typography>
          </Box>

          {/* Bestsellers Section */}
          <Box className="info-block bestsellers-block">
            <Typography className="info-block-heading">Bestsellers</Typography>
            <Box className="bestsellers-scroll-row">
              {bestSellers.map((item) => (
                <ProductCard
                  key={`${item.storeId || ""}:${item.productId || item.id}`}
                  {...item}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Floating Cart Bar if cart has items */}
      {cartCount > 0 && (
        <Box className="floating-cart-bar" onClick={handleViewCart}>
          <Typography className="floating-cart-left">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} | {formatCurrency(itemTotal)}
          </Typography>
          <Box className="floating-cart-right">
            <span>View cart</span>
            <ChevronRightIcon fontSize="small" />
          </Box>
        </Box>
      )}

      {/* Bottom Sticky Action Bar */}
      <Box className="sticky-bottom-bar">
        <Box className="price-info">
          <Typography className="bottom-price">{productPriceKnown ? formatCurrency(selectedVariant?.price ?? product.price ?? 0) : 'Price unavailable'}</Typography>
          {productPriceKnown && Number(selectedVariant?.compareAtPrice ?? product.compareAtPrice) > Number(selectedVariant?.price ?? product.price ?? 0) && <Typography className="compare-at-price">{formatCurrency(selectedVariant?.compareAtPrice ?? product.compareAtPrice)}</Typography>}
          <Typography className="taxes-note">(incl. of all taxes)</Typography>
        </Box>
        {productQuantity > 0 ? (
          <Box className="sticky-qty-selector">
            <button
              className="sticky-qty-btn"
              disabled={cartLoading || productLoading}
              onClick={() => updateQuantity(product.productId, selectedVariant?.variantId || selectedVariant?.id, -1, product.storeId)}
            >
              -
            </button>
            <span className="sticky-qty-count">{productQuantity}</span>
            <button
              className="sticky-qty-btn"
              disabled={cartLoading || productLoading || checkingStock || insufficientStock || !productPriceKnown}
              onClick={handleAddProduct}
            >
              +
            </button>
          </Box>
        ) : (
          <Button className="bottom-add-btn" disabled={!catalogProduct || productLoading || cartLoading || checkingStock || isOutOfStock || !productPriceKnown} onClick={handleAddProduct}>
            {productLoading || checkingStock ? 'LOADING...' : cartLoading ? 'ADDING...' : !productPriceKnown ? 'PRICE UNAVAILABLE' : insufficientStock ? 'STOCK LIMIT' : isOutOfStock ? 'UNAVAILABLE' : 'ADD +'}
          </Button>
        )}
      </Box>
      <Dialog open={Boolean(activeLink)} onClose={() => setActiveLink(null)} fullWidth maxWidth="md"><DialogTitle>{activeLink?.label}</DialogTitle><DialogContent className="in-app-browser"><iframe title={`${activeLink?.label || 'Product'} in-app viewer`} src={activeLink?.label === 'YouTube' ? youtubeEmbedUrl(activeLink?.url) : activeLink?.url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" /></DialogContent><DialogActions><Button onClick={() => setActiveLink(null)}>Close</Button><Button startIcon={<LaunchOutlinedIcon />} onClick={() => window.open(activeLink?.url,'_blank','noopener,noreferrer')}>Open externally</Button></DialogActions></Dialog>
    </Box>
  );
};

export default ProductInfo;

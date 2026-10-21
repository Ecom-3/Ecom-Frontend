export const resolvedPromotionScope=(promotion = {})=>({
  ...promotion,
  scope:promotion.scope || (promotion.store ? 'Store' : promotion.location ? 'Location' : 'Global'),
});

export const promotionApplies=(promotion,{location='',store=''})=>{
  const item=resolvedPromotionScope(promotion);
  if(item.scope==='Global') return true;
  if(item.scope==='Location') return Boolean(location)&&item.location===location;
  return Boolean(store)&&item.store===store;
};

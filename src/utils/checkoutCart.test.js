import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCheckoutCart } from './checkoutCart.js';
const memory = () => { const map = new Map(); return { getItem: key => map.get(key), setItem: (key,value) => map.set(key,value), removeItem: key => map.delete(key) }; };
test('cart sync persists the add retry key after a lost response', async () => {
  const storage=memory(); const cart={ id:'cart',customerId:'owner',storeId:'store',status:'ACTIVE',items:[] };
  let original;let sends=0;
  const api={getActiveCart:async()=>cart,getCart:async()=>cart,addCartItem:async(_id,item,key)=>{
    sends++;if(sends===1){original=key;throw new Error('timeout');}assert.equal(key,original);return {...cart,items:[item]};
  }};
  const items=[{productId:'product',quantity:1}];
  await assert.rejects(prepareCheckoutCart('owner','store',items,api,storage));
  await prepareCheckoutCart('owner','store',items,api,storage);
  assert.equal(sends,2);
  await assert.rejects(prepareCheckoutCart('owner','store',[{productId:'other',quantity:2}],api,storage));
});
test('checkout rejects a foreign cart and never creates or modifies items', async () => {
  const api={getActiveCart:async()=>({id:'foreign',customerId:'other',storeId:'store',items:[]})};
  await assert.rejects(prepareCheckoutCart('owner','store',[{productId:'product',quantity:1}],api,memory()),/ownership/);
});

test('unsubmitted owned active cart can reconcile changed items with new add keys', async () => {
  const storage=memory(); const old=[{productId:'old',quantity:1}];
  storage.setItem('checkout-cart:owner:store',JSON.stringify({body:JSON.stringify(old),cartId:'cart',keys:['old-key']}));
  let cart={id:'cart',customerId:'owner',storeId:'store',status:'ACTIVE',items:[{...old[0],id:'line'}]};
  const api={getCart:async()=>cart,removeCartItem:async()=>{cart={...cart,items:[]};return cart;},
    addCartItem:async(_id,item,key)=>{assert.notEqual(key,'old-key');cart={...cart,items:[{...item,id:'new-line'}]};return cart;}};
  const result=await prepareCheckoutCart('owner','store',[{productId:'new',quantity:1}],api,storage,true);
  assert.deepEqual(result.items.map(item=>item.productId),['new']);
});

test('changed items after checkout use a new cart and leave the claimed cart untouched', async () => {
  const storage=memory();
  storage.setItem('checkout-cart:owner:store',JSON.stringify({body:JSON.stringify([{productId:'old',quantity:1}]),cartId:'claimed',keys:['old-key']}));
  const claimed={id:'claimed',customerId:'owner',storeId:'store',status:'CHECKED_OUT',items:[{productId:'old',quantity:1}]};
  let active=null;
  const api={
    getCart:async(id)=>id==='claimed'?claimed:active,
    getActiveCart:async()=>{if(!active){const error=new Error('not found');error.status=404;throw error;}return active;},
    createCart:async({customerId,storeId})=>{active={id:'fresh',customerId,storeId,status:'ACTIVE',items:[]};return active;},
    addCartItem:async(_id,item)=>{active={...active,items:[{...item,id:'fresh-line'}]};return active;},
  };
  const result=await prepareCheckoutCart('owner','store',[{productId:'new',quantity:1}],api,storage,true);
  assert.equal(result.id,'fresh');
  assert.equal(claimed.status,'CHECKED_OUT');
  assert.deepEqual(claimed.items.map(item=>item.productId),['old']);
  assert.deepEqual(result.items.map(item=>item.productId),['new']);
  assert.equal(JSON.parse(storage.getItem('checkout-cart:owner:store')).cartId,'fresh');
});

test('unexpected active cart contents are never overwritten when starting changed checkout', async () => {
  const storage=memory();const old=JSON.stringify({body:JSON.stringify([{productId:'old',quantity:1}]),cartId:'claimed',keys:['keep']});
  storage.setItem('checkout-cart:owner:store',old);
  await assert.rejects(prepareCheckoutCart('owner','store',[{productId:'new',quantity:1}],{
    getCart:async()=>({id:'claimed',customerId:'owner',storeId:'store',status:'CHECKED_OUT',items:[{productId:'old',quantity:1}]}),
    getActiveCart:async()=>({id:'active',customerId:'owner',storeId:'store',status:'ACTIVE',items:[{productId:'other-session',quantity:1}]}),
    removeCartItem:async()=>assert.fail('No mutation allowed'),addCartItem:async()=>assert.fail('No mutation allowed'),
  },storage,true),/other items/);
  assert.equal(JSON.parse(storage.getItem('checkout-cart:owner:store')).cartId,'active');
});

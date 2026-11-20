const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const rupiah = (value) => new Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value)||0);
const dateKey = (date = new Date()) => date.toISOString().slice(0,10);
const safe = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const starterProducts = [
  {id:1,name:'Kopi Susu',price:15000,stock:20},
  {id:2,name:'Teh Manis',price:5000,stock:30},
  {id:3,name:'Roti Bakar',price:12000,stock:15},
  {id:4,name:'Mie Goreng',price:14000,stock:12},
  {id:5,name:'Air Mineral',price:4000,stock:40},
  {id:6,name:'Pisang Goreng',price:8000,stock:18}
];
let products = JSON.parse(localStorage.getItem('kk_products') || 'null') || starterProducts;
let transactions = JSON.parse(localStorage.getItem('kk_transactions') || '[]');
let cart = [];
let toastTimer;
function save(){localStorage.setItem('kk_products',JSON.stringify(products));localStorage.setItem('kk_transactions',JSON.stringify(transactions));}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);}
function showPage(page){
  $$('.page').forEach(el=>el.classList.toggle('active',el.id===`page-${page}`));
  $$('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
  const names={dashboard:['RINGKASAN USAHA','Dashboard'],kasir:['TRANSAKSI','Kasir'],produk:['KATALOG TOKO','Produk'],riwayat:['AKTIVITAS TOKO','Riwayat Transaksi'],laporan:['PERFORMA USAHA','Laporan']};
  $('#pageEyebrow').textContent=names[page][0];$('#pageTitle').textContent=names[page][1];
  $('#sidebar').classList.remove('open');
  renderAll();
}
$$('.nav-link').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
$$('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.goto)));
$('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#todayLabel').textContent=new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date());

function renderDashboard(){
  const today=transactions.filter(t=>t.date.slice(0,10)===dateKey());
  $('#todaySales').textContent=rupiah(today.reduce((s,t)=>s+t.total,0));
  $('#todayCount').textContent=`${today.length} transaksi hari ini`;
  $('#totalTransactions').textContent=transactions.length;
  $('#totalProducts').textContent=products.length;
  $('#lowStock').textContent=products.filter(p=>p.stock<=5).length;
  const recent=[...transactions].reverse().slice(0,5);
  $('#recentTransactions').innerHTML=recent.length?tableHTML(['ID TRANSAKSI','TANGGAL','TOTAL','STATUS'],recent.map(t=>[safe(t.id),new Date(t.date).toLocaleString('id-ID'),rupiah(t.total),'<span class="pill">Selesai</span>'])):'<div class="empty-state">Belum ada transaksi. Mulai catat penjualan dari menu Kasir.</div>';
}
function tableHTML(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderProducts(){
  const rows=products.map(p=>[ `<strong>${safe(p.name)}</strong>`,rupiah(p.price),p.stock,`<span class="pill ${p.stock<=5?'low':''}">${p.stock<=5?'Stok menipis':'Tersedia'}</span>`,`<button class="action-btn" data-edit="${p.id}">Edit</button><button class="action-btn delete" data-delete="${p.id}">Hapus</button>`]);
  $('#productsTable').innerHTML=products.length?tableHTML(['NAMA PRODUK','HARGA','STOK','STATUS','AKSI'],rows):'<div class="empty-state">Belum ada produk. Tambahkan produk pertamamu.</div>';
  $$('[data-edit]').forEach(b=>b.addEventListener('click',()=>openProductModal(Number(b.dataset.edit))));
  $$('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteProduct(Number(b.dataset.delete))));
}
function renderPos(){
  const term=$('#productSearch').value.toLowerCase();
  const filtered=products.filter(p=>p.name.toLowerCase().includes(term));
  $('#posProducts').innerHTML=filtered.length?filtered.map(p=>`<button class="product-tile" data-add="${p.id}" ${p.stock<=0?'disabled':''}><div class="product-emoji">🛍️</div><strong>${safe(p.name)}</strong><small>Stok: ${p.stock}</small><b>${rupiah(p.price)}</b></button>`).join(''):'<div class="empty-state">Produk tidak ditemukan.</div>';
  $$('[data-add]').forEach(b=>b.addEventListener('click',()=>addToCart(Number(b.dataset.add))));
}
function addToCart(id){const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return toast('Stok produk habis.');const item=cart.find(x=>x.id===id);if(item&&item.qty>=p.stock)return toast('Jumlah melebihi stok.');if(item)item.qty++;else cart.push({id,qty:1});renderCart();}
function changeQty(id,delta){const item=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(!item)return;const next=item.qty+delta;if(next<=0)cart=cart.filter(x=>x.id!==id);else if(next<=p.stock)item.qty=next;else toast('Jumlah melebihi stok.');renderCart();}
function cartTotal(){return cart.reduce((sum,item)=>{const p=products.find(x=>x.id===item.id);return sum+(p?p.price*item.qty:0)},0);}
function renderCart(){
  $('#cartCount').textContent=`${cart.reduce((s,x)=>s+x.qty,0)} item`;
  $('#cartItems').innerHTML=cart.length?cart.map(item=>{const p=products.find(x=>x.id===item.id);return `<div class="cart-item"><div class="cart-item-info"><strong>${safe(p.name)}</strong><small>${rupiah(p.price)} × ${item.qty}</small></div><div class="qty-control"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div>`}).join(''):'<div class="empty-state">Keranjang masih kosong.</div>';
  $$('[data-qty]').forEach(b=>b.addEventListener('click',()=>changeQty(Number(b.dataset.qty),Number(b.dataset.delta))));
  const total=cartTotal();$('#cartSubtotal').textContent=rupiah(total);$('#cartTotal').textContent=rupiah(total);
  const paid=Number($('#paymentAmount').value)||0;$('#changeAmount').textContent=rupiah(Math.max(0,paid-total));
}
function checkout(){
  if(!cart.length)return toast('Keranjang masih kosong.');
  const total=cartTotal(),paid=Number($('#paymentAmount').value);
  if(!paid||paid<total)return toast('Nominal pembayaran belum mencukupi.');
  const items=cart.map(item=>{const p=products.find(x=>x.id===item.id);return {name:p.name,price:p.price,qty:item.qty}});
  cart.forEach(item=>{const p=products.find(x=>x.id===item.id);p.stock-=item.qty;});
  transactions.push({id:'KK-'+Date.now().toString().slice(-8),date:new Date().toISOString(),items,total,paid,change:paid-total});
  save();cart=[];$('#paymentAmount').value='';renderAll();renderCart();toast('Pembayaran berhasil disimpan.');
}
function renderTransactions(){
  const rows=[...transactions].reverse().map(t=>[safe(t.id),new Date(t.date).toLocaleString('id-ID'),t.items.map(i=>`${safe(i.name)} (${i.qty})`).join(', '),rupiah(t.total),'<span class="pill">Selesai</span>']);
  $('#transactionsTable').innerHTML=rows.length?tableHTML(['ID','WAKTU','ITEM','TOTAL','STATUS'],rows):'<div class="empty-state">Belum ada transaksi yang tercatat.</div>';
}
function renderReports(){
  const revenue=transactions.reduce((s,t)=>s+t.total,0);
  $('#reportRevenue').textContent=rupiah(revenue);$('#reportCount').textContent=transactions.length;$('#reportAverage').textContent=rupiah(transactions.length?revenue/transactions.length:0);
  const byDate={};transactions.forEach(t=>{const key=t.date.slice(0,10);byDate[key]=(byDate[key]||0)+t.total;});
  const entries=Object.entries(byDate).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,10),max=Math.max(1,...entries.map(x=>x[1]));
  $('#salesReport').innerHTML=entries.length?entries.map(([date,total])=>`<div class="report-row"><span>${new Date(date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</span><div class="report-bar"><span style="width:${total/max*100}%"></span></div><strong>${rupiah(total)}</strong></div>`).join(''):'<div class="empty-state">Laporan akan muncul setelah ada transaksi.</div>';
}
function renderAll(){renderDashboard();renderProducts();renderPos();renderTransactions();renderReports();}

function openProductModal(id=null){
  const p=products.find(x=>x.id===id);$('#productForm').reset();$('#productId').value=p?p.id:'';$('#modalTitle').textContent=p?'Edit Produk':'Tambah Produk';
  if(p){$('#productName').value=p.name;$('#productPrice').value=p.price;$('#productStock').value=p.stock;}
  $('#productModal').classList.add('show');$('#productName').focus();
}
function closeProductModal(){$('#productModal').classList.remove('show');}
$('#addProductButton').addEventListener('click',()=>openProductModal());
$('#closeModal').addEventListener('click',closeProductModal);$('#cancelModal').addEventListener('click',closeProductModal);
$('#productModal').addEventListener('click',e=>{if(e.target.id==='productModal')closeProductModal();});
$('#productForm').addEventListener('submit',e=>{
  e.preventDefault();const id=$('#productId').value,name=$('#productName').value.trim(),price=Number($('#productPrice').value),stock=Number($('#productStock').value);
  if(!name||price<=0||stock<0)return toast('Periksa kembali data produk.');
  if(id){Object.assign(products.find(p=>p.id===Number(id)),{name,price,stock});toast('Produk berhasil diperbarui.');}
  else{products.push({id:Date.now(),name,price,stock});toast('Produk berhasil ditambahkan.');}
  save();closeProductModal();renderAll();
});
function deleteProduct(id){if(!confirm('Hapus produk ini?'))return;products=products.filter(p=>p.id!==id);cart=cart.filter(x=>x.id!==id);save();renderAll();renderCart();toast('Produk dihapus.');}
$('#productSearch').addEventListener('input',renderPos);
$('#paymentAmount').addEventListener('input',renderCart);
$('#checkoutButton').addEventListener('click',checkout);
$('#clearCart').addEventListener('click',()=>{cart=[];$('#paymentAmount').value='';renderCart();});
$('#exportTransactions').addEventListener('click',()=>{
  if(!transactions.length)return toast('Belum ada data untuk diunduh.');
  const rows=[['ID','Tanggal','Item','Total','Dibayar','Kembalian'],...transactions.map(t=>[t.id,new Date(t.date).toLocaleString('id-ID'),t.items.map(i=>`${i.name} x${i.qty}`).join('; '),t.total,t.paid,t.change])];
  const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='laporan-kasirkita.csv';a.click();URL.revokeObjectURL(url);
});
renderAll();renderCart();

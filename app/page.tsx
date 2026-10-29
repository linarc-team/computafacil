'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Cpu, Download, FileText, Headphones, Heart, Instagram, MapPin, MessageCircle, Minus, Monitor, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, Truck, X, Zap } from 'lucide-react';
import { siAmd, siAsus, siCorsair, siDiscord, siElgato, siHyperx, siIntel, siJbl, siKingstontechnology, siLenovo, siLg, siNvidia, siRazer, siRedragon, siSamsung, siSeagate, siSteelseries } from 'simple-icons';
import { categories, money, products, type Category, type Product, type ProductVariant } from '@/lib/catalog';
import { authClient } from '@/lib/auth/client';

type CartItem = { product: Product; quantity: number };
type StoreUser = { id: string; name?: string | null; email: string };
type OrderSummary = { reference: string; items: Array<{ title?: string; quantity?: number; unitPrice?: number }>; shipping?: Record<string,string>; paymentMethod?: string; transactionId?: string | null; amountCents: number; status: string; trackingCode?: string | null; createdAt: string; demo: boolean };
const date = '04/11';
const logoBySlug = { amd: siAmd, asus: siAsus, corsair: siCorsair, elgato: siElgato, hyperx: siHyperx, intel: siIntel, jbl: siJbl, kingstontechnology: siKingstontechnology, lenovo: siLenovo, lg: siLg, nvidia: siNvidia, razer: siRazer, redragon: siRedragon, samsung: siSamsung, seagate: siSeagate, steelseries: siSteelseries };
const logoImageBySlug: Record<string, string> = { pny: '/brands/pny.svg', aoc: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aoc_international_logo.svg', logitech: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logitech_logo.svg', xpg: 'https://quadrastores.com/cdn/shop/collections/XPG_logo.png?v=1759053770&width=300', philips: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Philips_logo_neu.JPG', multi: 'https://iconlogovector.com/uploads/images/2024/09/lg-66dc0a7f33041-Multi-Multilaser-agora-e-Mu.webp', 'western-digital': 'https://commons.wikimedia.org/wiki/Special:FilePath/Western_Digital_logo_%282022%29.svg', '8bitdo': 'https://upload.wikimedia.org/wikipedia/commons/a/ac/8BitDo_logo.png', anker: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Anker_logo.svg', fifine: 'https://files.smarty.cz/products/tools/logo/fifine.jpg', northbayou: 'https://shop.tti.com.ph/pub/media/rokanthemes/brand/northbayou.png', tdagger: 'https://static.wixstatic.com/media/71a6c2_dd8e98071fa44f72ac6cf631b2f6860a~mv2.png/v1/fill/w_280%2Ch_48%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/T-DAGGER_LOGO-2_360x.png' };
function BrandMark({ brand, brandIcon }: Pick<Product, 'brand' | 'brandIcon'>) {
  const icon = logoBySlug[brandIcon as keyof typeof logoBySlug];
  const logoImage = logoImageBySlug[brandIcon];
  return <span className={`product-brand brand-${brandIcon}`} title={brand} aria-label={brand} style={icon ? { color: `#${icon.hex}` } : undefined}>{icon ? <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d={icon.path}/></svg> : logoImage ? <img src={logoImage} alt=""/> : <span className="brand-wordmark">{brand}</span>}<span>{brand}</span></span>;
}

function AccountDialog({ close, onAuthenticated, initialMode = 'signin', checkoutRequired = false }: { close: () => void; onAuthenticated: (user: StoreUser) => void; initialMode?: 'signin' | 'signup'; checkoutRequired?: boolean }) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = mode === 'signup'
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || 'Não foi possível acessar sua conta.');
      const session = await authClient.getSession();
      const user = session.data?.user;
      if (user) { onAuthenticated({ id: user.id, name: user.name, email: user.email }); close(); }
      else if (mode === 'signup') { setMode('signin'); setError('Conta criada. Se a confirmação por e-mail estiver ativa, confirme seu endereço e entre para continuar.'); }
      else throw new Error('Não encontramos uma sessão ativa. Tente entrar novamente.');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      setError(/503|service unavailable|temporariamente indisponível/i.test(message)
        ? 'O cadastro está temporariamente indisponível. Tente novamente mais tarde.'
        : message || 'Não foi possível acessar sua conta. Tente novamente.');
    } finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&close()}><section className="checkout-modal account-modal" aria-label="Entrar ou criar conta">
    <header className="modal-head"><div><span className="eyebrow">COMPUTAFACIL · SUA CONTA</span><h2>{mode==='signup'?'Crie sua conta':'Bem-vindo de volta'}</h2></div><button className="icon-button" onClick={close} aria-label="Fechar"><X size={20}/></button></header>
    {checkoutRequired&&<p className="account-notice"><ShieldCheck size={16}/> Para comprar, entre ou crie uma conta. Assim podemos proteger seu pedido e acompanhar a entrega.</p>}
    <form className="account-form" onSubmit={submit}>
      {mode==='signup'&&<label>Nome completo<input required autoComplete="name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Seu nome"/></label>}
      <label>E-mail<input required type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="voce@email.com"/></label>
      <label>Senha<input required minLength={8} type="password" autoComplete={mode==='signup'?'new-password':'current-password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres"/></label>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <button className="button button-red account-submit" disabled={busy}>{busy?<><span className="spinner"/>Aguarde…</>:mode==='signup'?'Criar minha conta':'Entrar com minha conta'}</button>
    </form>
    <div className="account-switch">{mode==='signup'?'Já tem uma conta?':'Ainda não tem conta?'} <button onClick={()=>{setMode(mode==='signup'?'signin':'signup');setError('')}}>{mode==='signup'?'Entre':'Cadastre-se'}</button></div>
    <p className="secure-note"><ShieldCheck size={15}/> Seus dados de acesso são protegidos.</p>
  </section></div>;
}

function DeliveriesDialog({ close }: { close: () => void }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    let active = true;
    fetch('/api/orders', { cache: 'no-store' }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar suas entregas.');
      if (active) setOrders(result.orders || []);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Tente novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const statusLabel = (status: string) => ({ DELIVERED: 'Entregue', PAID: 'Preparando para envio', IN_TRANSIT: 'Em trânsito', PENDING: 'Aguardando pagamento', FAILED: 'Pagamento não concluído', CANCELLED: 'Cancelado' }[status] || status);
  return <div className="deliveries-backdrop"><section className="deliveries-page" role="dialog" aria-modal="true" aria-label="Minhas entregas"><header className="deliveries-page-head"><div>{selectedOrder&&<button className="text-button" onClick={()=>setSelectedOrder(null)}><ChevronLeft size={16}/> Voltar aos pedidos</button>}<span className="eyebrow">SUA CONTA</span><h1>{selectedOrder?`Pedido ${selectedOrder.reference}`:'Minhas Entregas'}</h1></div><button className="icon-button" onClick={close} aria-label="Voltar para a loja"><X size={20}/></button></header>{loading?<div className="delivery-empty"><span className="spinner"/>Carregando seus pedidos…</div>:error?<div className="form-error" role="alert">{error}</div>:selectedOrder?<div className="delivery-detail"><div className="delivery-detail-status"><PackageCheck size={25}/><div><span>Situação atual</span><strong>{statusLabel(selectedOrder.status)}</strong></div></div><div className="delivery-timeline"><div className="timeline-step done"><i/><span>Pedido realizado</span></div><div className={`timeline-step ${['PAID','IN_TRANSIT','DELIVERED'].includes(selectedOrder.status)?'done':''}`}><i/><span>Pagamento confirmado</span></div><div className={`timeline-step ${['IN_TRANSIT','DELIVERED'].includes(selectedOrder.status)?'done':''}`}><i/><span>Em preparação e envio</span></div><div className={`timeline-step ${selectedOrder.status==='DELIVERED'?'done':''}`}><i/><span>Entrega concluída</span></div></div><article className="delivery-order"><h2>Itens do pedido</h2>{selectedOrder.items.map((item,index)=><div className="delivery-items" key={index}><span>{item.title} × {item.quantity}</span><strong>{money(((item.unitPrice||0)*(item.quantity||1))/100)}</strong></div>)}<footer><span>Total</span><strong>{money(selectedOrder.amountCents/100)}</strong></footer></article><article className="delivery-order"><h2>Pagamento e entrega</h2><p>Forma de pagamento: {selectedOrder.paymentMethod||'PIX'}</p><p>Data: {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>{selectedOrder.trackingCode&&<p>Código de rastreio: {selectedOrder.trackingCode}</p>}<p>Endereço: {selectedOrder.shipping?.street} {selectedOrder.shipping?.number}, {selectedOrder.shipping?.neighborhood}, {selectedOrder.shipping?.city}/{selectedOrder.shipping?.state} · CEP {selectedOrder.shipping?.zipCode}</p>{selectedOrder.demo&&<small>Pedido fictício de demonstração, sem pagamento real.</small>}</article></div>:orders.length===0?<div className="delivery-empty"><PackageCheck size={32}/><h3>Você ainda não tem pedidos</h3><p>Quando fizer uma compra, o acompanhamento aparecerá aqui.</p></div>:<div className="delivery-list">{orders.map((order)=><button className="delivery-order delivery-order-button" key={order.reference} onClick={()=>setSelectedOrder(order)}><header><div><span className="eyebrow">{order.demo?'EXEMPLO DE DEMONSTRAÇÃO':'PEDIDO'}</span><strong>{order.reference}</strong></div><span className={`delivery-status ${order.status==='DELIVERED'?'delivery-complete':''}`}>{statusLabel(order.status)} <ChevronRight size={15}/></span></header><p className="delivery-date">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p><div className="delivery-items">{order.items?.map((item,index)=><div key={`${order.reference}-${index}`}><span>{item.title || 'Produto'} × {item.quantity || 1}</span><strong>{money(((item.unitPrice || 0)*(item.quantity || 1))/100)}</strong></div>)}</div><footer><span>{order.trackingCode?`Rastreio: ${order.trackingCode}`:'Ver situação e detalhes'}</span><strong>{money(order.amountCents/100)}</strong></footer></button>)}</div>}</section></div>;
}

function Checkout({ cart, total, close, clear }: { cart: CartItem[]; total: number; close: () => void; clear: () => void }) {
  const [busy, setBusy] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [invoiceStage, setInvoiceStage] = useState<'idle'|'generating'|'ready'|'error'>('idle');
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [tracking, setTracking] = useState<{status:string;trackingCode:string|null}|null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });
  const checkoutTotal = couponApplied
    ? cart.reduce((sum, item) => sum + Math.round(Math.round(item.product.price * 100) * 0.7) * item.quantity, 0) / 100
    : total;
  const couponDiscount = total - checkoutTotal;
  const set = (key: keyof typeof form, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const fillCep = async () => {
    const cep = form.zipCode.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try { const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`); const address = await res.json(); if (!address.erro) setForm((f) => ({ ...f, street: address.logradouro || f.street, neighborhood: address.bairro || f.neighborhood, city: address.localidade || f.city, state: address.uf || f.state })); } catch { /* campos ficam disponíveis para preenchimento manual */ }
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: form, address: form, paymentMethod: 'pix', coupon: couponApplied ? 'COMPUTA' : undefined, cart: cart.map(({ product, quantity }) => ({ id: product.baseProductId ?? product.id, variantSize: product.selectedVariant, quantity })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível iniciar o pagamento.');
      setPayment(result.data);
      if (result.data?.status === 'PAID') clear();
    } catch (e) { setError(e instanceof Error ? e.message : 'Tente novamente.'); } finally { setBusy(false); }
  }
  async function copyPix() { const code = payment?.paymentData?.copyPaste; if (!code) return; await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  async function checkStatus() {
    if (!payment?.transactionId) return;
    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/payment/${encodeURIComponent(payment.transactionId)}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível consultar o pagamento.');
      const next = result.data || result;
      setPayment((current: any) => ({ ...current, ...next }));
      if (next.status === 'PAID') clear();
      else if (next.status === 'FAILED' || next.status === 'CANCELLED') setError('O pagamento não foi aprovado. Confira os dados e tente novamente.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Tente novamente.'); }
    finally { setCheckingStatus(false); }
  }
  async function retryInvoice() {
    if (!payment?.transactionId) return;
    setInvoiceStage('generating');
    try {
      const response = await fetch(`/api/invoice/${encodeURIComponent(payment.transactionId)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const html = await response.text();
      setInvoiceUrl(URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })));
      setInvoiceStage('ready');
    } catch { setInvoiceStage('error'); }
  }
  useEffect(() => {
    const transactionId = payment?.transactionId;
    if (!transactionId || payment?.status === 'PAID' || ['FAILED','CANCELLED'].includes(payment?.status)) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/${encodeURIComponent(transactionId)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        const next = result.data || result;
        if (next?.status) { setPayment((current: any) => ({ ...current, ...next })); if (next.status === 'PAID') clear(); }
      } catch { /* a consulta manual segue disponível */ }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [payment?.transactionId, payment?.status, clear]);
  useEffect(() => {
    if (payment?.status !== 'PAID' || !payment?.transactionId) return;
    let active = true;
    setInvoiceStage('generating');
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/invoice/${encodeURIComponent(payment.transactionId)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Não foi possível gerar o comprovante. Tente novamente.');
        const html = await response.text();
        if (!active) return;
        setInvoiceUrl(URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })));
        setInvoiceStage('ready');
        const trackingResponse = await fetch(`/api/tracking/${encodeURIComponent(payment.transactionId)}`, { cache: 'no-store' });
        if (trackingResponse.ok && active) setTracking(await trackingResponse.json());
      } catch { if (active) setInvoiceStage('error'); }
    }, 1100);
    return () => { active = false; window.clearTimeout(timer); };
  }, [payment?.status, payment?.transactionId]);
  useEffect(() => () => { if (invoiceUrl) URL.revokeObjectURL(invoiceUrl); }, [invoiceUrl]);
  const paid = payment?.status === 'PAID';
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}><section className="checkout-modal" aria-label="Finalizar compra">
    <header className="modal-head"><div><span className="eyebrow">CHECKOUT SEGURO</span><h2>{payment ? 'Pagamento iniciado' : 'Finalize seu pedido'}</h2></div><button className="icon-button" onClick={close} aria-label="Fechar"><X size={20}/></button></header>
    {payment ? <div className="payment-result">
      {payment.paymentData?.qrCodeBase64 && !paid && <img className="pix-qr" src={payment.paymentData.qrCodeBase64} alt="QR Code PIX para pagamento"/>}
      <div className="success-icon"><Check size={25}/></div><h3>{paid ? 'Pagamento aprovado!' : 'Aguardando pagamento PIX'}</h3>
      <p>{paid ? 'Pagamento confirmado pela ComputaFacil. Estamos preparando seu comprovante e o acompanhamento da entrega.' : 'Escaneie o QR Code ou copie o código PIX para concluir. Vamos consultar a confirmação automaticamente.'}</p>
      {payment.paymentData?.copyPaste && <div className="pix-copy"><code>{payment.paymentData.copyPaste}</code><button className="button button-red" onClick={copyPix}>{copied ? <Check size={15}/> : null}{copied ? 'Copiado' : 'Copiar código PIX'}</button></div>}
      {paid ? <div className="post-payment-actions"><div className="invoice-status" role="status">{invoiceStage==='generating'?<><span className="spinner"/>Confirmando e gerando seu comprovante…</>:invoiceStage==='ready'?<><FileText size={17}/> Comprovante pronto para baixar</>:<><span className="spinner"/>Preparando seu comprovante…</>}</div>{invoiceStage==='ready'&&invoiceUrl&&<a className="button button-red" href={invoiceUrl} download={`computafacil-${payment.transactionId}.html`}><Download size={16}/> Baixar nota do pedido (HTML)</a>}{invoiceStage==='error'&&<button className="button button-red" onClick={retryInvoice}>Tentar gerar novamente</button>}<p className="legal-receipt-note">Comprovante do pedido; não substitui uma NF-e oficial.</p><div className="tracking-card"><div className="tracking-icon"><MapPin size={19}/></div><div><strong>Consultar seu rastreio</strong><span>{tracking?.trackingCode?`Código: ${tracking.trackingCode}`:'Preparando para envio'}</span><small>{tracking?.trackingCode?'Seu código de rastreio já está disponível.':'O código aparecerá aqui quando o pedido for postado.'}</small></div></div></div>:<button className="text-button" onClick={checkStatus} disabled={checkingStatus}>{checkingStatus ? 'Consultando pagamento…' : 'Já paguei · consultar agora'}</button>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <p className="small-note">Pedido {payment.transactionId} · {paid ? 'Confirmado pela ComputaFacil' : 'Aguardando confirmação'}</p>
      <button className="text-button" onClick={close}>Voltar para a loja</button>
    </div> : <form noValidate onSubmit={submit} className="checkout-body">
      <div className="checkout-summary"><div><ShoppingBag size={17}/><strong>{cart.reduce((sum, item) => sum + item.quantity, 0)} itens</strong><span>Frete grátis até {date}</span></div><strong>{money(checkoutTotal)}</strong></div>
      <div className="form-section coupon-section"><h3>Cupom de desconto</h3><div className="coupon-entry"><input aria-label="Cupom de desconto" value={couponInput} onChange={(event)=>{setCouponInput(event.target.value);setCouponApplied(false);setCouponMessage('');}} placeholder="Digite seu cupom"/><button type="button" className="button button-outline" onClick={()=>{if(couponInput.trim().toUpperCase()==='COMPUTA'){setCouponApplied(true);setCouponMessage('Cupom COMPUTA aplicado: 30% de desconto.');}else{setCouponApplied(false);setCouponMessage('Cupom inválido.');}}}>Aplicar</button></div>{couponMessage&&<p className={`coupon-message ${couponApplied?'coupon-success':''}`} role="status">{couponMessage}</p>}{couponApplied&&<div className="coupon-totals"><span>Subtotal <strong>{money(total)}</strong></span><span>Desconto COMPUTA (30%) <strong>−{money(couponDiscount)}</strong></span><span>Total com desconto <strong>{money(checkoutTotal)}</strong></span></div>}</div>
      <div className="form-section"><h3>Seus dados</h3><div className="form-grid"><label className="span-2">Nome completo<input required autoComplete="name" value={form.name} onChange={(e)=>set('name',e.target.value)} placeholder="Como aparece no documento"/></label><label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(e)=>set('email',e.target.value)} placeholder="voce@email.com"/></label><label>Telefone / WhatsApp<input required type="tel" autoComplete="tel" value={form.phone} onChange={(e)=>set('phone',e.target.value)} placeholder="(11) 99999-9999"/></label><label className="span-2">CPF<input required inputMode="numeric" value={form.cpf} onChange={(e)=>set('cpf',e.target.value)} placeholder="000.000.000-00" maxLength={14}/></label></div></div>
      <div className="form-section"><div className="form-title-row"><h3>Endereço de entrega</h3><span><Truck size={14}/> Até 14 dias úteis</span></div><div className="form-grid"><label>CEP<div className="cep-field"><input required inputMode="numeric" autoComplete="postal-code" value={form.zipCode} onChange={(e)=>set('zipCode',e.target.value)} onBlur={fillCep} placeholder="00000-000"/><a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei</a></div></label><label>Estado (UF)<input required autoComplete="address-level1" value={form.state} onChange={(e)=>set('state',e.target.value.toUpperCase().slice(0,2))} placeholder="SP" maxLength={2}/></label><label className="span-2">Rua / Avenida<input required autoComplete="street-address" value={form.street} onChange={(e)=>set('street',e.target.value)} placeholder="Logradouro"/></label><label>Número<input required value={form.number} onChange={(e)=>set('number',e.target.value)} placeholder="123"/></label><label>Complemento<input value={form.complement} onChange={(e)=>set('complement',e.target.value)} placeholder="Apto, bloco (opcional)"/></label><label>Bairro<input required value={form.neighborhood} onChange={(e)=>set('neighborhood',e.target.value)} placeholder="Seu bairro"/></label><label>Cidade<input required autoComplete="address-level2" value={form.city} onChange={(e)=>set('city',e.target.value)} placeholder="Sua cidade"/></label></div></div>
      <div className="form-section"><h3>Forma de pagamento</h3><div className="payment-option selected pix-only-option"><span className="payment-mark pix-mark">◇</span><span><strong>PIX</strong><small>Pagamento instantâneo com QR Code</small></span><Check size={16}/></div></div>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <button className="button button-red submit-order" disabled={busy}>{busy?<><span className="spinner"/>Preparando pagamento…</>:<>Pagar {money(checkoutTotal)} <ArrowRight size={18}/></>}</button>
      <p className="secure-note"><ShieldCheck size={15}/> Seus dados são protegidos pela ComputaFacil durante o pagamento.</p>
    </form>}
  </section></div>;
}

function describeProduct(product: Product) {
  const intros: Record<Category, string> = {
    'Placas de vídeo': 'Uma opção para jogar, criar e acelerar tarefas gráficas com a placa certa para o seu setup.',
    Monitores: 'Uma tela pensada para deixar jogos, trabalho e entretenimento mais confortáveis no dia a dia.',
    Processadores: 'O processador é o centro da montagem e ajuda a manter jogos e aplicativos respondendo com fluidez.',
    'Memória RAM': 'Mais memória para manter jogos e aplicativos abertos e dar agilidade à sua rotina no computador.',
    Periféricos: 'Um acessório escolhido para completar seu setup com a função e o formato que você procura.',
    Armazenamento: 'Espaço para guardar seus arquivos, jogos e aplicativos, com a capacidade selecionável abaixo.',
  };
  const benefits: Record<Category, string> = {
    'Placas de vídeo': 'Confira a compatibilidade com a fonte de alimentação, o espaço disponível no gabinete e as conexões do seu monitor antes da compra. Indicada para jogos, edição e aplicações que usam aceleração gráfica.',
    Monitores: 'Considere o espaço da mesa, a conexão disponível na placa de vídeo e a distância de uso. A resolução e a taxa de atualização do modelo ajudam a escolher entre produtividade, entretenimento e jogos.',
    Processadores: 'Antes de finalizar, confira a compatibilidade do soquete e do chipset da placa-mãe, além da solução de refrigeração adequada. O modelo atende tarefas do dia a dia e pode compor uma montagem equilibrada.',
    'Memória RAM': 'Verifique o tipo DDR, a capacidade suportada pela placa-mãe e a quantidade de módulos ideal para sua configuração. A instalação correta ajuda o computador a trabalhar com mais aplicativos e jogos abertos.',
    Periféricos: 'Confira o tipo de conexão e os recursos descritos para escolher o acessório ideal para seu espaço e sua rotina. Uma opção prática para complementar o computador ou renovar o setup.',
    Armazenamento: 'Escolha a capacidade que melhor atende sua biblioteca de jogos e arquivos. Confirme a interface e o formato suportados pela placa-mãe antes da instalação.',
  };
  return `${product.name}. ${product.detail} ${intros[product.category]} ${benefits[product.category]} Produto com garantia de 1 ano. Envio Full preparado e realizado pela ComputaFacil, com rastreamento do pedido e estimativa de entrega de até 14 dias úteis.`;
}

function getProductSpecs(product: Product, variant?: ProductVariant) {
  const specs: [string, string][] = [
    ['Marca', product.brand],
    ['Categoria', product.category],
  ];
  const memory = product.name.match(/\b(\d+(?:\.\d+)?\s?GB)\b/i)?.[1];
  const memoryType = product.name.match(/\bDDR[45]\b/i)?.[0];
  const speed = product.name.match(/\b\d+\s?(?:MHz|Hz)\b/i)?.[0];
  const screenSize = product.name.match(/\b\d+(?:\.\d+)?[”"]\b/)?.[0];
  if (product.category === 'Memória RAM') {
    if (memory) specs.push(['Capacidade', memory]);
    if (memoryType) specs.push(['Geração', memoryType]);
    if (speed) specs.push(['Velocidade', speed]);
  } else if (product.category === 'Monitores') {
    if (screenSize) specs.push(['Tamanho', screenSize]);
    if (speed) specs.push(['Atualização', speed]);
    const resolution = product.name.match(/\b(QHD|4K UHD|4K|IPS|UltraWide)\b/i)?.[0];
    if (resolution) specs.push(['Painel / resolução', resolution]);
  } else if (product.category === 'Placas de vídeo' && memory) {
    specs.push(['Memória gráfica', memory]);
  } else if (product.category === 'Armazenamento') {
    if (variant) specs.push(['Capacidade selecionada', variant.size]);
    if (product.detail.includes('NVMe')) specs.push(['Interface', 'M.2 NVMe PCIe 4.0']);
    else if (product.detail.includes('SATA')) specs.push(['Interface', 'SATA']);
  } else if (product.category === 'Processadores') {
    const family = product.name.match(/\b(?:Ryzen\s[3579]|Core\s(?:i[3579]|Ultra\s[57]))\b/i)?.[0];
    if (family) specs.push(['Linha', family]);
  }
  return specs;
}

function ProductDetails({ product, price, variant, favorite, close, add, toggleFavorite, selectVariant }: {
  product: Product;
  price: number;
  variant?: ProductVariant;
  favorite: boolean;
  close: () => void;
  add: () => void;
  toggleFavorite: () => void;
  selectVariant: (size: string) => void;
}) {
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => setJustAdded(false), [product.id, variant?.size]);
  const specs = getProductSpecs(product, variant);
  return <div className="modal-backdrop product-details-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <section className="product-details-modal" role="dialog" aria-modal="true" aria-labelledby="product-details-title">
      <button className="icon-button product-details-close" onClick={close} aria-label="Fechar detalhes"><X size={20}/></button>
      <div className="product-details-gallery"><img src={product.image} alt={product.name}/><span className="details-image-caption"><BadgeCheck size={14}/> Produto selecionado</span></div>
      <div className="product-details-content">
        <div className="product-details-brand"><span className="product-category">{product.category}</span><BrandMark brand={product.brand} brandIcon={product.brandIcon}/></div>
        <h2 id="product-details-title">{product.name}</h2>
        <p className="product-details-description">{describeProduct(product)}</p>
        <div className="product-details-specs"><h3>Detalhes do produto</h3><dl>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
        {product.variants&&<div className="details-variants"><span>Escolha a capacidade</span><div>{product.variants.map((option)=><button type="button" key={option.size} className={variant?.size===option.size?'selected':''} onClick={()=>selectVariant(option.size)}>{option.size}<small>{money(option.price)}</small></button>)}</div></div>}
        <div className="product-details-price"><span>{money(price)}<small> no PIX</small></span>{product.oldPrice>price&&<del>{money(product.oldPrice)}</del>}</div>
        <p className="details-installments">Pagamento seguro e rápido via PIX.</p>
        <div className="details-shipping"><span><Truck size={16}/> Frete grátis</span><span><PackageCheck size={16}/> Envio Full feito pela ComputaFacil</span><span><BadgeCheck size={16}/> Garantia de 1 ano</span><span><PackageCheck size={16}/> Estimativa de até 14 dias úteis</span></div>
        <div className="product-details-actions"><button className="button button-red details-add-button" onClick={()=>{add();setJustAdded(true)}}>{justAdded?<><Check size={17}/> Adicionado ao carrinho</>:<>Adicionar ao carrinho <Plus size={17}/></>}</button><button className={`button button-outline details-favorite-button ${favorite?'is-favorite':''}`} onClick={toggleFavorite}><Heart size={17} fill={favorite?'currentColor':'none'}/>{favorite?'Salvo nos favoritos':'Favoritar produto'}</button></div>
        <p className="details-payment-note"><ShieldCheck size={14}/> Pagamento protegido via ComputaFacil</p>
      </div>
    </section>
  </div>;
}

const heroSlides = [
  { eyebrow: 'OFERTA DA SEMANA · FRETE GRÁTIS', first: 'Seu próximo', second: 'upgrade começa', accent: 'aqui.', description: 'Frete grátis em todo o Brasil até 04/11. Escolha seu próximo componente com mais tranquilidade.', button: 'Explorar ofertas', category: 'Tudo' as const, badgeLabel: 'FRETE', badgeValue: 'R$ 0', badgeFoot: 'ATÉ 04/11', tag: 'Entrega grátis pra você', tagNote: 'Hardware pra atualizar seu setup', image: '/brand/hero-gpu.png', imageAlt: 'Placas de vídeo e componentes para computador', contain: false },
  { eyebrow: 'PREÇO DE REVENDA', first: 'Tecnologia boa', second: 'sem pagar', accent: 'a mais.', description: 'Ofertas em peças e acessórios para você montar seu computador gastando menos.', button: 'Ver preços', category: 'Placas de vídeo' as const, badgeLabel: 'PREÇO', badgeValue: 'JUSTO', badgeFoot: 'OFERTAS NO PIX', tag: 'Mais desempenho pelo seu dinheiro', tagNote: 'Escolha e compare no catálogo', image: 'https://images.nvidia.com/aem-dam/Solutions/geforce/graphics-cards/gtx-1660-ti/geforce-gtx-1660-ti-gallery-k.jpg', imageAlt: 'Placa de vídeo NVIDIA GeForce GTX 1660 Ti', contain: true },
  { eyebrow: 'IMAGEM FLUIDA · FULL HD', first: 'Uma tela melhor', second: 'muda todo', accent: 'o setup.', description: 'Monitores para trabalhar, jogar e curtir cada detalhe, do custo-benefício ao alto desempenho.', button: 'Ver monitores', category: 'Monitores' as const, badgeLabel: 'ATÉ', badgeValue: '100', badgeFoot: 'HZ FULL HD', tag: 'Mais fluidez no dia a dia', tagNote: 'Explore a categoria de monitores', image: '/products/aoc-24b35hm2-23-8-full-hd-100hz.webp', imageAlt: 'Monitor AOC 24B35HM2 Full HD 100 Hz', contain: true },
  { eyebrow: 'DO BÁSICO AO GAMER', first: 'Complete seu', second: 'setup do seu', accent: 'jeito.', description: 'Mouses, teclados, fones e acessórios para deixar seu espaço pronto para qualquer partida.', button: 'Ver periféricos', category: 'Periféricos' as const, badgeLabel: 'SETUP', badgeValue: 'ON', badgeFoot: 'DO SEU JEITO', tag: 'Periféricos para todo estilo', tagNote: 'Encontre seu próximo acessório', image: '/products/razer-deathadder-v3-pro-mouse.webp', imageAlt: 'Mouse gamer Razer DeathAdder V3 Pro', contain: true },
];

export default function Home() {
  const [category, setCategory] = useState<Category | 'Tudo'>('Tudo');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveriesOpen, setDeliveriesOpen] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartNotice, setCartNotice] = useState('');
  const [cartNoticeTick, setCartNoticeTick] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<Record<string, string>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'signin'|'signup'>('signin');
  const [checkoutRequired, setCheckoutRequired] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [pendingDeliveries, setPendingDeliveries] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<StoreUser | null>(null);
  useEffect(() => {
    authClient.getSession().then(({data}) => { const current = data?.user; if (current) setUser({id: current.id, name: current.name, email: current.email}); }).catch(() => {}).finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => {
    if (!cartNotice) return;
    const timeout = window.setTimeout(() => setCartNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [cartNotice, cartNoticeTick]);
  const filtered = useMemo(() => products.filter((p) => (category === 'Tudo' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const visible = showAll || category !== 'Tudo' || query ? filtered : filtered.slice(0, 8);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const detailVariant = detailProduct?.variants?.find((option) => option.size === (selectedStorage[detailProduct.id] ?? detailProduct.variants?.[0]?.size));
  const detailPrice = detailVariant?.price ?? detailProduct?.price ?? 0;
  function add(product: Product, variant?: ProductVariant) {
    const selected = variant ? { ...product, id: `${product.id}-${variant.size.toLowerCase().replace(/[^a-z0-9]+/g, '')}`, baseProductId: product.id, selectedVariant: variant.size, name: `${product.name} · ${variant.size}`, price: variant.price } : product;
    setCart((old) => { const found = old.find((item) => item.product.id === selected.id); return found ? old.map((item) => item.product.id === selected.id ? { ...item, quantity: Math.min(item.quantity + 1, 10) } : item) : [...old, { product: selected, quantity: 1 }]; });
    setCartNotice('Adicionado ao carrinho!');
    setCartNoticeTick((tick) => tick + 1);
  }
  function changeQuantity(id: string, delta: number) { setCart((old) => old.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)); }
  function beginCheckout() {
    setCartOpen(false);
    if (!user) { setPendingCheckout(true); setCheckoutRequired(true); setAccountMode('signin'); setAccountOpen(true); return; }
    setCheckoutOpen(true);
  }
  function revealDeliveries() { setDeliveryLoading(true); window.setTimeout(() => { setDeliveryLoading(false); setDeliveriesOpen(true); }, 620); }
  function authenticated(nextUser: StoreUser) { setUser(nextUser); if (pendingCheckout) { setPendingCheckout(false); setCheckoutRequired(false); setCheckoutOpen(true); } else if (pendingDeliveries) { setPendingDeliveries(false); revealDeliveries(); } }
  async function signOut() { try { await authClient.signOut(); } finally { setUser(null); setAccountOpen(false); setDeliveriesOpen(false); setCheckoutRequired(false); setPendingCheckout(false); setPendingDeliveries(false); } }
  function openDeliveries() { if (!user) { setPendingDeliveries(true); setCheckoutRequired(false); setAccountMode('signin'); setAccountOpen(true); return; } revealDeliveries(); }
  function goHome() { setCategory('Tudo'); setShowAll(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function selectCategory(next: Category | 'Tudo') { setCategory(next); setShowAll(next !== 'Tudo'); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }
  return <main>
    <div className="promo-bar"><span><Zap size={14} fill="currentColor"/> FRETE GRÁTIS em todo o Brasil até <strong>{date}</strong></span><span className="promo-end">Aproveite enquanto dá tempo <ArrowRight size={14}/></span></div>
    <header className="site-header"><div className="header-main"><a className="brand" href="#inicio" aria-label="ComputaFacil início"><img className="brand-mark" src="/brand/computafacil-mark.png" alt=""/><span className="brand-copy">Computa<span>Facil</span><small>TECNOLOGIA PRA SUA VIDA</small></span></a><div className="search-box"><Search size={19}/><input placeholder="O que você está procurando?" value={query} onChange={(e)=>{setQuery(e.target.value); document.getElementById('produtos')?.scrollIntoView({behavior:'smooth'});}}/><kbd>⌘ K</kbd></div><div className="header-actions">{user?<div className="account-action"><span className="account-icon">{user.name?.charAt(0).toUpperCase()||'♙'}</span><span>Olá, {user.name?.split(' ')[0]||'cliente'}<small><button onClick={signOut}>Sair da conta</button></small></span></div>:<button className="account-action" onClick={()=>{setCheckoutRequired(false);setAccountMode('signin');setAccountOpen(true)}} disabled={authLoading}><span className="account-icon">♙</span><span>Olá, visitante<small>{authLoading?'Verificando…':'Entrar / cadastrar'}</small></span></button>}<button className="header-cart" onClick={()=>setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={21}/><span className="cart-count">{cart.reduce((n,i)=>n+i.quantity,0)}</span></button></div></div>
      <nav className="nav-bar"><div className="nav-inner"><button onClick={goHome} className={category==='Tudo'?'active':''}>Início</button><button onClick={openDeliveries}>Minhas Entregas</button>{categories.map((item)=><button key={item.name} onClick={()=>selectCategory(item.name)} className={category===item.name?'active':''}>{item.name}</button>)}<button className="deals-nav" onClick={()=>selectCategory('Tudo')}><Zap size={14}/> Ofertas</button><span className="nav-note"><ShieldCheck size={14}/> Compra protegida</span></div></nav>
    </header>
    <section className="hero" id="inicio" aria-label="Destaque da ComputaFacil"><article className="hero-slide"><div className="hero-copy"><div className="hero-label"><span/> {heroSlides[0].eyebrow}</div><h1>{heroSlides[0].first}<br/>{heroSlides[0].second} <em>{heroSlides[0].accent}</em></h1><p>{heroSlides[0].description}</p><button className="button button-white" onClick={()=>selectCategory(heroSlides[0].category)}>{heroSlides[0].button} <ArrowRight size={17}/></button><div className="hero-perks"><span><Truck size={16}/> Frete grátis até {date}</span><i/><span><ShieldCheck size={16}/> Compra protegida</span></div></div><div className="hero-visual"><div className="hero-glow"/><img src={heroSlides[0].image} alt={heroSlides[0].imageAlt}/><div className="hero-sticker"><span>{heroSlides[0].badgeLabel}</span><strong>{heroSlides[0].badgeValue}</strong><span>{heroSlides[0].badgeFoot}</span></div><div className="hero-product-tag"><span className="tag-spark">✳</span><span>{heroSlides[0].tag}<small>{heroSlides[0].tagNote}</small></span><ArrowUpRight size={18}/></div></div></article></section>
    <section className="trust-strip"><div><Truck/><span><strong>Frete grátis</strong><small>Até {date}, para todo o Brasil</small></span></div><div><PackageCheck/><span><strong>Chega rapidinho</strong><small>Entrega em até 14 dias úteis</small></span></div><div><ShieldCheck/><span><strong>Compra protegida</strong><small>Pagamento protegido via ComputaFacil</small></span></div><div><BadgeCheck/><span><strong>Produtos originais</strong><small>Qualidade que você merece</small></span></div></section>
    <section className="category-section"><div className="section-top"><div><span className="eyebrow">ENCONTRE O QUE PROCURA</span><h2>Explore por categoria</h2></div><button className="text-button" onClick={()=>selectCategory('Tudo')}>Ver tudo <ArrowRight size={15}/></button></div><div className="category-grid">{categories.map((item,index)=><button className={`category-card category-${index}`} key={item.name} onClick={()=>selectCategory(item.name)}><img src={item.image} alt=""/><span className="category-overlay"/><span className="category-info"><span className="cat-icon">{item.icon}</span><strong>{item.name}</strong><small>{products.filter(p=>p.category===item.name).length} produtos <ArrowRight size={14}/></small></span></button>)}</div></section>
    <section className="products-section" id="produtos"><div className="section-top products-heading"><div><span className="eyebrow">ESCOLHIDOS PRA VOCÊ</span><h2>{category==='Tudo'?'Mais vendidos':category}<span className="product-total">{filtered.length}</span></h2></div><div className="product-controls"><button className="filter-select" onClick={()=>selectCategory(category==='Tudo'?'Placas de vídeo':'Tudo')}>{category==='Tudo'?'Todas as categorias':category}<ChevronDown size={15}/></button><button className="view-toggle" onClick={()=>setShowAll(!showAll)}>{showAll?'Mostrar destaques':'Ver todos'} <ArrowRight size={15}/></button></div></div>
      <div className="product-grid">{visible.map((product,index)=>{const variant=product.variants?.find((option)=>option.size===(selectedStorage[product.id]??product.variants?.[0]?.size));const price=variant?.price??product.price;const hasBrandLogo=true;return <article className="product-card" key={product.id}><div className="product-image"><button className="product-open-image" onClick={()=>setDetailProduct(product)} aria-label={`Ver detalhes de ${product.name}`}><img src={product.image} loading={index>3?'lazy':'eager'} alt={product.name}/></button>{hasBrandLogo&&<div className="product-logo-stamp"><BrandMark brand={product.brand} brandIcon={product.brandIcon}/></div>}{product.oldPrice>price&&<span className="discount-badge">-{Math.round((1-price/product.oldPrice)*100)}%</span>}{product.badge&&<span className={`product-badge ${product.badge==='Oferta'?'badge-red':''}`}>{product.badge==='Oferta'?<Zap size={11} fill="currentColor"/>:null}{product.badge}</span>}<button className={`favorite-button ${favorites.includes(product.id)?'favorite-on':''}`} onClick={()=>setFavorites((old)=>old.includes(product.id)?old.filter(id=>id!==product.id):[...old,product.id])} aria-label={favorites.includes(product.id)?'Remover dos favoritos':'Favoritar produto'}><Heart size={17} fill={favorites.includes(product.id)?'currentColor':'none'}/></button></div><div className="product-info"><div className="product-brand-line"><span className="product-category">{product.category}</span><BrandMark brand={product.brand} brandIcon={product.brandIcon}/></div><button className="product-open-title" onClick={()=>setDetailProduct(product)}>{product.name}</button>{product.variants&&<div className="storage-options" aria-label={`Capacidade para ${product.name}`}>{product.variants.map((option)=><button type="button" key={option.size} className={(variant?.size===option.size?'selected':'')} onClick={()=>setSelectedStorage((current)=>({...current,[product.id]:option.size}))}>{option.size}</button>)}</div>}<div className="price-row"><span>{money(price)}<small> no PIX</small></span>{product.oldPrice>price&&<del>{money(product.oldPrice)}</del>}</div><div className="installments">Pagamento via PIX</div><button className="add-button" onClick={()=>add(product,variant)}>Adicionar ao carrinho <Plus size={16}/></button></div></article>})}</div>
      {!visible.length&&<div className="empty-results"><Search size={30}/><h3>Nenhum produto encontrado</h3><p>Tente outro termo ou escolha uma categoria.</p><button className="text-button" onClick={()=>{setQuery('');setCategory('Tudo')}}>Limpar filtros</button></div>}
      {category==='Tudo'&&!query&&<div className="all-products"><button className="button button-outline" onClick={()=>setShowAll(!showAll)}>{showAll?'Mostrar menos':'Ver todos os produtos'} {showAll?<ArrowDown size={16}/>:<ArrowRight size={16}/>}</button></div>}</section>
    <section className="promo-banner"><div className="promo-banner-copy"><span className="eyebrow">SEU SETUP MERECE</span><h2>Grandes ideias.<br/>Desempenho <em>gigante.</em></h2><p>Seu setup ideal está mais perto do que você imagina.<br/>Escolha, monte e aproveite.</p><button className="button button-white" onClick={()=>selectCategory('Periféricos')}>Complete seu setup <ArrowRight size={16}/></button></div><div className="promo-abstract"><div className="abstract-ring ring-one"/><div className="abstract-ring ring-two"/><img className="promo-brand-logo" src="/brand/computafacil-logo-bw.png" alt="ComputaFacil"/><div className="abstract-square"/></div></section>
    <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><a className="brand brand-light" href="#inicio"><img className="brand-full-logo" src="/brand/computafacil-logo-light.png" alt="ComputaFacil"/></a><p>O seu próximo upgrade começa aqui.<br/>Tecnologia com preço justo e atendimento de verdade.</p><a className="discord-link" href="https://discord.gg/computafacil" target="_blank" rel="noreferrer" aria-label="Entre no Discord da ComputaFacil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={siDiscord.path}/></svg><span>Entre no nosso Discord</span></a><a className="discord-link instagram-link" href="https://www.instagram.com/computafacil/" target="_blank" rel="noopener noreferrer" aria-label="Siga @computafacil no Instagram"><Instagram size={17}/><span>@computafacil</span></a></div><div><h4>Explore</h4>{categories.map(c=><button key={c.name} onClick={()=>selectCategory(c.name)}>{c.name}</button>)}</div><div><h4>Compra segura</h4><span><ShieldCheck size={15}/> Pagamento protegido</span><span><Truck size={15}/> Frete grátis até {date}</span><span><PackageCheck size={15}/> Envio de Pequim, China</span><span><Check size={15}/> Prazo de até 14 dias úteis</span></div></div><div className="footer-bottom"><span>© 2026 ComputaFacil. Feito para quem ama tecnologia.</span><span>Envio internacional de Pequim, China · Estimativa de até 14 dias úteis</span><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><span>CNPJ: 24.618.388/0001-57</span></div></footer>
    {cartOpen&&<div className="drawer-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&setCartOpen(false)}><aside className="cart-drawer"><div className="drawer-head"><div><span className="eyebrow">SUA SELEÇÃO</span><h2>Meu carrinho <small>{cart.reduce((n,i)=>n+i.quantity,0)} itens</small></h2></div><button className="icon-button" onClick={()=>setCartOpen(false)}><X/></button></div>{!cart.length?<div className="empty-cart"><span className="empty-bag"><ShoppingBag size={27}/></span><h3>Seu carrinho está vazio</h3><p>Descubra as peças perfeitas para o seu próximo upgrade.</p><button className="button button-red" onClick={()=>setCartOpen(false)}>Explorar produtos <ArrowRight size={16}/></button></div>:<><div className="cart-items">{cart.map(({product,quantity})=><div className="cart-item" key={product.id}><img src={product.image} alt=""/><div className="cart-item-info"><small>{product.category} · {product.brand}</small><strong>{product.name}</strong><span>{money(product.price)}</span><div className="quantity-control"><button onClick={()=>changeQuantity(product.id,-1)}><Minus size={13}/></button><span>{quantity}</span><button onClick={()=>changeQuantity(product.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>changeQuantity(product.id,-quantity)} aria-label="Remover produto"><X size={15}/></button></div>)}</div><div className="cart-footer"><div className="shipping-free"><Truck size={16}/><span>Parabéns! O frete grátis já está garantido.</span><Check size={15}/></div><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Frete grátis até {date} · estimativa de até 14 dias úteis.</p>{!user&&<p className="auth-needed">Para comprar, você precisa entrar ou criar uma conta.</p>}<button className="button button-red checkout-button" onClick={beginCheckout} disabled={authLoading}>{authLoading?'Verificando sua conta…':user?'Ir para o pagamento':'Entrar e continuar'} <ArrowRight size={17}/></button><button className="continue-shopping" onClick={()=>setCartOpen(false)}><ChevronLeft size={16}/> Continuar comprando</button><div className="payment-logos"><ShieldCheck size={15}/> Pagamento protegido via ComputaFacil <span>Somente PIX</span></div></div></>}</aside></div>}
    <button className="floating-cart" onClick={()=>setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={20}/><span>{cart.reduce((n,i)=>n+i.quantity,0)}</span></button>
    {checkoutOpen&&<Checkout cart={cart} total={total} close={()=>setCheckoutOpen(false)} clear={()=>setCart([])}/>}
    {deliveryLoading&&<div className="delivery-loading-backdrop" role="status" aria-live="polite"><div className="delivery-loading-card"><span className="delivery-loader-ring"/><strong>Carregando suas entregas</strong><span>Buscando seus pedidos e atualizações…</span><div className="delivery-loading-bar"><i/></div></div></div>}
    {deliveriesOpen&&<DeliveriesDialog close={()=>setDeliveriesOpen(false)}/>}
    {detailProduct&&<ProductDetails product={detailProduct} price={detailPrice} variant={detailVariant} favorite={favorites.includes(detailProduct.id)} close={()=>setDetailProduct(null)} add={()=>add(detailProduct,detailVariant)} toggleFavorite={()=>setFavorites((old)=>old.includes(detailProduct.id)?old.filter((id)=>id!==detailProduct.id):[...old,detailProduct.id])} selectVariant={(size)=>setSelectedStorage((current)=>({...current,[detailProduct.id]:size}))}/>}
    {accountOpen&&<AccountDialog close={()=>{setAccountOpen(false);setCheckoutRequired(false);setPendingCheckout(false);setPendingDeliveries(false)}} onAuthenticated={authenticated} initialMode={accountMode} checkoutRequired={checkoutRequired}/>}
    {cartNotice&&<div className="cart-toast" role="status" aria-live="polite"><span><Check size={17}/></span><strong>{cartNotice}</strong></div>}
  </main>;
}

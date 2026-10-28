'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, ChevronLeft, ChevronRight, Cpu, CreditCard, Headphones, Heart, Menu, Minus, Monitor, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, Truck, X, Zap } from 'lucide-react';
import { siAmd, siAsus, siCorsair, siDiscord, siElgato, siHyperx, siIntel, siJbl, siKingstontechnology, siLenovo, siLg, siNvidia, siRazer, siRedragon, siSamsung, siSeagate, siSteelseries } from 'simple-icons';
import { categories, money, products, type Category, type Product, type ProductVariant } from '@/lib/catalog';
import { authClient } from '@/lib/auth/client';

type CartItem = { product: Product; quantity: number };
type StoreUser = { id: string; name?: string | null; email: string };
const date = '04/11';
const logoBySlug = { amd: siAmd, asus: siAsus, corsair: siCorsair, elgato: siElgato, hyperx: siHyperx, intel: siIntel, jbl: siJbl, kingstontechnology: siKingstontechnology, lenovo: siLenovo, lg: siLg, nvidia: siNvidia, razer: siRazer, redragon: siRedragon, samsung: siSamsung, seagate: siSeagate, steelseries: siSteelseries };
const logoImageBySlug: Record<string, string> = { pny: '/brands/pny.svg', aoc: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aoc_international_logo.svg', logitech: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logitech_logo.svg', xpg: 'https://quadrastores.com/cdn/shop/collections/XPG_logo.png?v=1759053770&width=300', philips: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Philips_logo_neu.JPG', multi: 'https://iconlogovector.com/uploads/images/2024/09/lg-66dc0a7f33041-Multi-Multilaser-agora-e-Mu.webp', 'western-digital': 'https://commons.wikimedia.org/wiki/Special:FilePath/Western_Digital_logo_%282022%29.svg', '8bitdo': 'https://upload.wikimedia.org/wikipedia/commons/a/ac/8BitDo_logo.png', anker: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Anker_logo.svg', fifine: 'https://files.smarty.cz/products/tools/logo/fifine.jpg', northbayou: 'https://shop.tti.com.ph/pub/media/rokanthemes/brand/northbayou.png' };
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
      setError(cause instanceof Error ? cause.message : 'Não foi possível conectar ao serviço de contas.');
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
    <p className="secure-note"><ShieldCheck size={15}/> Conta segura com autenticação Neon.</p>
  </section></div>;
}
function Checkout({ cart, total, close, clear }: { cart: CartItem[]; total: number; close: () => void; clear: () => void }) {
  const [method, setMethod] = useState<'pix' | 'credit_card'>('pix');
  const [installments, setInstallments] = useState(1);
  const [busy, setBusy] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', holderName: '', cardNumber: '', expiry: '', cvv: '' });
  const set = (key: keyof typeof form, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const fillCep = async () => {
    const cep = form.zipCode.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try { const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`); const address = await res.json(); if (!address.erro) setForm((f) => ({ ...f, street: address.logradouro || f.street, neighborhood: address.bairro || f.neighborhood, city: address.localidade || f.city, state: address.uf || f.state })); } catch { /* campos ficam disponíveis para preenchimento manual */ }
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const [month = '', year = ''] = form.expiry.split('/');
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-screen-width': String(window.screen.width), 'x-screen-height': String(window.screen.height) }, body: JSON.stringify({ customer: form, address: form, paymentMethod: method, cart: cart.map(({ product, quantity }) => ({ id: product.baseProductId ?? product.id, variantSize: product.selectedVariant, quantity })), card: { number: form.cardNumber, holderName: form.holderName, expiryMonth: month, expiryYear: year, cvv: form.cvv, installments } }) });
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
  function continue3DS() {
    const challenge = payment?.threeDS?.start;
    if (!challenge?.acsUrl || !challenge?.acsPayload || !challenge.acsUrl.startsWith('https://')) {
      setError('A etapa de autenticação ainda não está disponível. Consulte o status do pagamento em instantes.');
      return;
    }
    const form = document.createElement('form');
    form.method = 'POST'; form.action = challenge.acsUrl;
    Object.entries(challenge.acsPayload as Record<string, unknown>).forEach(([name, value]) => {
      const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = String(value); form.appendChild(input);
    });
    document.body.appendChild(form); form.submit();
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}><section className="checkout-modal" aria-label="Finalizar compra">
    <header className="modal-head"><div><span className="eyebrow">CHECKOUT SEGURO</span><h2>{payment ? 'Pagamento iniciado' : 'Finalize seu pedido'}</h2></div><button className="icon-button" onClick={close} aria-label="Fechar"><X size={20}/></button></header>
    {payment ? <div className="payment-result">
      {payment.paymentData?.qrCodeBase64 && <img className="pix-qr" src={payment.paymentData.qrCodeBase64} alt="QR Code PIX para pagamento"/>}
      <div className="success-icon"><Check size={25}/></div><h3>{payment.status === 'PAID' ? 'Pagamento aprovado!' : 'Seu pedido está quase lá'}</h3>
      <p>{payment.paymentMethod === 'pix' ? 'Escaneie o QR Code ou copie o código PIX abaixo para concluir.' : payment.status === 'PENDING_3DS' ? 'Seu cartão precisa de uma etapa de autenticação. Continue pelo link seguro do pagamento.' : payment.status === 'PAID' ? 'Recebemos seu pagamento. Em breve você recebe as atualizações do envio.' : 'Aguarde a confirmação do pagamento.'}</p>
      {payment.paymentData?.copyPaste && <div className="pix-copy"><code>{payment.paymentData.copyPaste}</code><button className="button button-red" onClick={copyPix}>{copied ? <Check size={15}/> : null}{copied ? 'Copiado' : 'Copiar código PIX'}</button></div>}
      {payment.status === 'PENDING_3DS' && payment.threeDS?.start?.acsUrl && <button className="button button-red invoice-link" onClick={continue3DS}>Autenticar cartão com segurança <ArrowUpRight size={16}/></button>}
      {payment.invoiceUrl && <a className="button button-red invoice-link" href={payment.invoiceUrl} target="_blank" rel="noreferrer">Abrir pagamento seguro <ArrowUpRight size={16}/></a>}
      {['PENDING', 'PENDING_3DS'].includes(payment.status) && <button className="text-button" onClick={checkStatus} disabled={checkingStatus}>{checkingStatus ? 'Processando com segurança…' : 'Já paguei · consultar situação'}</button>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <p className="small-note">Pedido {payment.transactionId} · {payment.status === 'PAID' ? 'Confirmado pela ComputaFacil' : 'Aguardando confirmação'}</p>
      <button className="text-button" onClick={close}>Voltar para a loja</button>
    </div> : <form onSubmit={submit} className="checkout-body">
      <div className="checkout-summary"><div><ShoppingBag size={17}/><strong>{cart.reduce((sum, item) => sum + item.quantity, 0)} itens</strong><span>Frete grátis até {date}</span></div><strong>{money(total)}</strong></div>
      <div className="form-section"><h3>Seus dados</h3><div className="form-grid"><label className="span-2">Nome completo<input required autoComplete="name" value={form.name} onChange={(e)=>set('name',e.target.value)} placeholder="Como aparece no documento"/></label><label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(e)=>set('email',e.target.value)} placeholder="voce@email.com"/></label><label>Telefone / WhatsApp<input required type="tel" autoComplete="tel" value={form.phone} onChange={(e)=>set('phone',e.target.value)} placeholder="(11) 99999-9999"/></label><label className="span-2">CPF<input required inputMode="numeric" value={form.cpf} onChange={(e)=>set('cpf',e.target.value)} placeholder="000.000.000-00" maxLength={14}/></label></div></div>
      <div className="form-section"><div className="form-title-row"><h3>Endereço de entrega</h3><span><Truck size={14}/> Até 14 dias úteis</span></div><div className="form-grid"><label>CEP<div className="cep-field"><input required inputMode="numeric" autoComplete="postal-code" value={form.zipCode} onChange={(e)=>set('zipCode',e.target.value)} onBlur={fillCep} placeholder="00000-000"/><a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer">Não sei</a></div></label><label>Estado (UF)<input required autoComplete="address-level1" value={form.state} onChange={(e)=>set('state',e.target.value.toUpperCase().slice(0,2))} placeholder="SP" maxLength={2}/></label><label className="span-2">Rua / Avenida<input required autoComplete="street-address" value={form.street} onChange={(e)=>set('street',e.target.value)} placeholder="Logradouro"/></label><label>Número<input required value={form.number} onChange={(e)=>set('number',e.target.value)} placeholder="123"/></label><label>Complemento<input value={form.complement} onChange={(e)=>set('complement',e.target.value)} placeholder="Apto, bloco (opcional)"/></label><label>Bairro<input required value={form.neighborhood} onChange={(e)=>set('neighborhood',e.target.value)} placeholder="Seu bairro"/></label><label>Cidade<input required autoComplete="address-level2" value={form.city} onChange={(e)=>set('city',e.target.value)} placeholder="Sua cidade"/></label></div></div>
      <div className="form-section"><h3>Forma de pagamento</h3><div className="payment-options"><button type="button" onClick={()=>setMethod('pix')} className={`payment-option ${method==='pix'?'selected':''}`}><span className="payment-mark pix-mark">◇</span><span><strong>PIX</strong><small>Aprovação rápida</small></span>{method==='pix'&&<Check size={16}/>}</button><button type="button" onClick={()=>setMethod('credit_card')} className={`payment-option ${method==='credit_card'?'selected':''}`}><CreditCard size={18}/><span><strong>Cartão de crédito</strong><small>Pagamento seguro</small></span>{method==='credit_card'&&<Check size={16}/>}</button></div>
        {method==='credit_card'&&<div className="form-grid card-fields"><label className="span-2">Número do cartão<input required autoComplete="cc-number" inputMode="numeric" value={form.cardNumber} onChange={(e)=>set('cardNumber',e.target.value)} placeholder="0000 0000 0000 0000"/></label><label className="span-2">Nome impresso no cartão<input required autoComplete="cc-name" value={form.holderName} onChange={(e)=>set('holderName',e.target.value)} placeholder="NOME NO CARTÃO"/></label><label>Validade<input required autoComplete="cc-exp" value={form.expiry} onChange={(e)=>set('expiry',e.target.value)} placeholder="MM/AAAA" maxLength={7}/></label><label>CVV<input required autoComplete="cc-csc" inputMode="numeric" type="password" value={form.cvv} onChange={(e)=>set('cvv',e.target.value)} placeholder="•••" maxLength={4}/></label><label className="span-2">Parcelamento<select value={installments} onChange={(e)=>setInstallments(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9,10].map((count)=><option key={count} value={count}>{count}x de {money(total/count)}{count===1?' à vista':''}</option>)}</select></label></div>}
      </div>
      {error&&<div className="form-error" role="alert">{error}</div>}
      <button className="button button-red submit-order" disabled={busy}>{busy?<><span className="spinner"/>Preparando pagamento…</>:<>Pagar {money(total)} <ArrowRight size={18}/></>}</button>
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
        <p className="details-installments">ou em até 10x de {money(price/10)} no cartão</p>
        <div className="details-shipping"><span><Truck size={16}/> Frete grátis</span><span><PackageCheck size={16}/> Envio Full feito pela ComputaFacil</span><span><BadgeCheck size={16}/> Garantia de 1 ano</span><span><PackageCheck size={16}/> Estimativa de até 14 dias úteis</span></div>
        <div className="product-details-actions"><button className="button button-red details-add-button" onClick={()=>{add();setJustAdded(true)}}>{justAdded?<><Check size={17}/> Adicionado ao carrinho</>:<>Adicionar ao carrinho <Plus size={17}/></>}</button><button className={`button button-outline details-favorite-button ${favorite?'is-favorite':''}`} onClick={toggleFavorite}><Heart size={17} fill={favorite?'currentColor':'none'}/>{favorite?'Salvo nos favoritos':'Favoritar produto'}</button></div>
        <p className="details-payment-note"><ShieldCheck size={14}/> Pagamento protegido via ComputaFacil</p>
      </div>
    </section>
  </div>;
}

export default function Home() {
  const [category, setCategory] = useState<Category | 'Tudo'>('Tudo');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartNotice, setCartNotice] = useState('');
  const [cartNoticeTick, setCartNoticeTick] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<Record<string, string>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<'signin'|'signup'>('signin');
  const [checkoutRequired, setCheckoutRequired] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
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
  function authenticated(nextUser: StoreUser) { setUser(nextUser); if (pendingCheckout) { setPendingCheckout(false); setCheckoutRequired(false); setCheckoutOpen(true); } }
  async function signOut() { try { await authClient.signOut(); } finally { setUser(null); setAccountOpen(false); setCheckoutRequired(false); setPendingCheckout(false); } }
  function selectCategory(next: Category | 'Tudo') { setCategory(next); setShowAll(next !== 'Tudo'); setMenuOpen(false); document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' }); }
  return <main>
    <div className="promo-bar"><span><Zap size={14} fill="currentColor"/> FRETE GRÁTIS em todo o Brasil até <strong>{date}</strong></span><span className="promo-end">Aproveite enquanto dá tempo <ArrowRight size={14}/></span></div>
    <header className="site-header"><div className="header-main"><button className="mobile-menu icon-button" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Abrir menu"><Menu/></button><a className="brand" href="#inicio" aria-label="ComputaFacil início"><span className="brand-symbol"><Cpu size={23}/></span><span>computafacil<span className="brand-dot">.</span><small>TECNOLOGIA PRA SUA VIDA</small></span></a><div className="search-box"><Search size={19}/><input placeholder="O que você está procurando?" value={query} onChange={(e)=>{setQuery(e.target.value); document.getElementById('produtos')?.scrollIntoView({behavior:'smooth'});}}/><kbd>⌘ K</kbd></div><div className="header-actions">{user?<div className="account-action"><span className="account-icon">{user.name?.charAt(0).toUpperCase()||'♙'}</span><span>Olá, {user.name?.split(' ')[0]||'cliente'}<small><button onClick={signOut}>Sair da conta</button></small></span></div>:<button className="account-action" onClick={()=>{setCheckoutRequired(false);setAccountMode('signin');setAccountOpen(true)}} disabled={authLoading}><span className="account-icon">♙</span><span>Olá, visitante<small>{authLoading?'Verificando…':'Entrar / cadastrar'}</small></span></button>}<button className="header-cart" onClick={()=>setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={21}/><span className="cart-count">{cart.reduce((n,i)=>n+i.quantity,0)}</span></button></div></div>
      <nav className={`nav-bar ${menuOpen?'nav-open':''}`}><div className="nav-inner"><button onClick={()=>selectCategory('Tudo')} className={category==='Tudo'?'active':''}>Início</button>{categories.map((item)=><button key={item.name} onClick={()=>selectCategory(item.name)} className={category===item.name?'active':''}>{item.name}</button>)}<button className="deals-nav" onClick={()=>selectCategory('Tudo')}><Zap size={14}/> Ofertas</button><span className="nav-note"><ShieldCheck size={14}/> Compra protegida</span></div></nav>
    </header>
    <section className="hero" id="inicio"><div className="hero-copy"><div className="hero-label"><span/> TECH WEEK · OFERTAS ESPECIAIS</div><h1>Seu próximo<br/>upgrade começa <em>aqui.</em></h1><p>Performance de verdade, preço que faz sentido.<br/>Monte o setup dos seus sonhos.</p><button className="button button-white" onClick={()=>selectCategory('Tudo')}>Explorar produtos <ArrowRight size={17}/></button><div className="hero-perks"><span><Truck size={16}/> Frete grátis até {date}</span><i/><span><ShieldCheck size={16}/> Compra segura</span></div></div><div className="hero-visual"><div className="hero-glow"/><img src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1300&q=90" alt="Componentes de computador gamer com iluminação"/><div className="hero-sticker"><span>ATÉ</span><strong>14</strong><span>DIAS<br/>PRA CHEGAR</span></div><div className="hero-product-tag"><span className="tag-spark">✳</span><span>Performance sem limites<small>Atualize seu setup hoje</small></span><ArrowUpRight size={18}/></div></div><div className="hero-index">01 <span/> 04</div></section>
    <section className="trust-strip"><div><Truck/><span><strong>Frete grátis</strong><small>Até {date}, para todo o Brasil</small></span></div><div><PackageCheck/><span><strong>Chega rapidinho</strong><small>Entrega em até 14 dias úteis</small></span></div><div><ShieldCheck/><span><strong>Compra protegida</strong><small>Pagamento protegido via ComputaFacil</small></span></div><div><BadgeCheck/><span><strong>Produtos originais</strong><small>Qualidade que você merece</small></span></div></section>
    <section className="category-section"><div className="section-top"><div><span className="eyebrow">ENCONTRE O QUE PROCURA</span><h2>Explore por categoria</h2></div><button className="text-button" onClick={()=>selectCategory('Tudo')}>Ver tudo <ArrowRight size={15}/></button></div><div className="category-grid">{categories.map((item,index)=><button className={`category-card category-${index}`} key={item.name} onClick={()=>selectCategory(item.name)}><img src={item.image} alt=""/><span className="category-overlay"/><span className="category-info"><span className="cat-icon">{item.icon}</span><strong>{item.name}</strong><small>{products.filter(p=>p.category===item.name).length} produtos <ArrowRight size={14}/></small></span></button>)}</div></section>
    <section className="products-section" id="produtos"><div className="section-top products-heading"><div><span className="eyebrow">ESCOLHIDOS PRA VOCÊ</span><h2>{category==='Tudo'?'Mais vendidos':category}<span className="product-total">{filtered.length}</span></h2></div><div className="product-controls"><button className="filter-select" onClick={()=>selectCategory(category==='Tudo'?'Placas de vídeo':'Tudo')}>{category==='Tudo'?'Todas as categorias':category}<ChevronDown size={15}/></button><button className="view-toggle" onClick={()=>setShowAll(!showAll)}>{showAll?'Mostrar destaques':'Ver todos'} <ArrowRight size={15}/></button></div></div>
      <div className="product-grid">{visible.map((product,index)=>{const variant=product.variants?.find((option)=>option.size===(selectedStorage[product.id]??product.variants?.[0]?.size));const price=variant?.price??product.price;const hasBrandLogo=['Monitores','Processadores','Memória RAM'].includes(product.category);return <article className="product-card" key={product.id}><div className="product-image"><button className="product-open-image" onClick={()=>setDetailProduct(product)} aria-label={`Ver detalhes de ${product.name}`}><img src={product.image} loading={index>3?'lazy':'eager'} alt={product.name}/></button>{hasBrandLogo&&<div className="product-logo-stamp"><BrandMark brand={product.brand} brandIcon={product.brandIcon}/></div>}{product.oldPrice>price&&<span className="discount-badge">-{Math.round((1-price/product.oldPrice)*100)}%</span>}{product.badge&&<span className={`product-badge ${product.badge==='Oferta'?'badge-red':''}`}>{product.badge==='Oferta'?<Zap size={11} fill="currentColor"/>:null}{product.badge}</span>}<button className={`favorite-button ${favorites.includes(product.id)?'favorite-on':''}`} onClick={()=>setFavorites((old)=>old.includes(product.id)?old.filter(id=>id!==product.id):[...old,product.id])} aria-label={favorites.includes(product.id)?'Remover dos favoritos':'Favoritar produto'}><Heart size={17} fill={favorites.includes(product.id)?'currentColor':'none'}/></button></div><div className="product-info"><div className="product-brand-line"><span className="product-category">{product.category}</span><BrandMark brand={product.brand} brandIcon={product.brandIcon}/></div><button className="product-open-title" onClick={()=>setDetailProduct(product)}>{product.name}</button>{product.variants&&<div className="storage-options" aria-label={`Capacidade para ${product.name}`}>{product.variants.map((option)=><button type="button" key={option.size} className={(variant?.size===option.size?'selected':'')} onClick={()=>setSelectedStorage((current)=>({...current,[product.id]:option.size}))}>{option.size}</button>)}</div>}<div className="price-row"><span>{money(price)}<small> no PIX</small></span>{product.oldPrice>price&&<del>{money(product.oldPrice)}</del>}</div><div className="installments">ou em até 10x de {money(price/10)} no cartão</div><button className="add-button" onClick={()=>add(product,variant)}>Adicionar ao carrinho <Plus size={16}/></button></div></article>})}</div>
      {!visible.length&&<div className="empty-results"><Search size={30}/><h3>Nenhum produto encontrado</h3><p>Tente outro termo ou escolha uma categoria.</p><button className="text-button" onClick={()=>{setQuery('');setCategory('Tudo')}}>Limpar filtros</button></div>}
      {category==='Tudo'&&!query&&<div className="all-products"><button className="button button-outline" onClick={()=>setShowAll(!showAll)}>{showAll?'Mostrar menos':'Ver todos os produtos'} {showAll?<ArrowDown size={16}/>:<ArrowRight size={16}/>}</button></div>}</section>
    <section className="promo-banner"><div className="promo-banner-copy"><span className="eyebrow">SEU SETUP MERECE</span><h2>Grandes ideias.<br/>Desempenho <em>gigante.</em></h2><p>Seu setup ideal está mais perto do que você imagina.<br/>Escolha, monte e aproveite.</p><button className="button button-white" onClick={()=>selectCategory('Periféricos')}>Complete seu setup <ArrowRight size={16}/></button></div><div className="promo-abstract"><div className="abstract-ring ring-one"/><div className="abstract-ring ring-two"/><span>CF<span>®</span></span><small>BUILD<br/>YOUR<br/>FUTURE</small><div className="abstract-square"/></div></section>
    <section className="newsletter"><div className="newsletter-icon"><Headphones size={22}/></div><div><h3>Precisa de ajuda com seu setup?</h3><p>Nosso atendimento pode ajudar a escolher cada componente.</p></div><a className="button button-red" href="mailto:oi@computafacil.com.br?subject=Ajuda%20com%20meu%20setup">Fale com a gente <ArrowRight size={16}/></a></section>
    <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><a className="brand brand-light" href="#inicio"><span className="brand-symbol"><Cpu size={22}/></span><span>computafacil<span className="brand-dot">.</span><small>TECNOLOGIA PRA SUA VIDA</small></span></a><p>O seu próximo upgrade começa aqui.<br/>Tecnologia com preço justo e atendimento de verdade.</p><a className="discord-link" href="https://discord.gg/computafacil" target="_blank" rel="noreferrer" aria-label="Entre no Discord da ComputaFacil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={siDiscord.path}/></svg><span>Entre no nosso Discord</span></a></div><div><h4>Explore</h4>{categories.map(c=><button key={c.name} onClick={()=>selectCategory(c.name)}>{c.name}</button>)}</div><div><h4>Atendimento</h4><a href="https://discord.gg/computafacil" target="_blank" rel="noreferrer">Fale com a loja pelo Discord</a><span>Razão social, endereço e canais oficiais pendentes de confirmação</span></div><div><h4>Compra segura</h4><span><ShieldCheck size={15}/> Pagamento protegido</span><span><Truck size={15}/> Frete grátis até {date}</span><span><PackageCheck size={15}/> Envio de Pequim, China</span><span><Check size={15}/> Prazo de até 14 dias úteis</span></div></div><div className="footer-bottom"><span>© 2026 ComputaFacil. Feito para quem ama tecnologia.</span><span>Envio internacional de Pequim, China · Estimativa de até 14 dias úteis</span><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><span>CNPJ provisório: 00.000.000/0000-00 · substituir antes de vender</span></div></footer>
    {cartOpen&&<div className="drawer-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&setCartOpen(false)}><aside className="cart-drawer"><div className="drawer-head"><div><span className="eyebrow">SUA SELEÇÃO</span><h2>Meu carrinho <small>{cart.reduce((n,i)=>n+i.quantity,0)} itens</small></h2></div><button className="icon-button" onClick={()=>setCartOpen(false)}><X/></button></div>{!cart.length?<div className="empty-cart"><span className="empty-bag"><ShoppingBag size={27}/></span><h3>Seu carrinho está vazio</h3><p>Descubra as peças perfeitas para o seu próximo upgrade.</p><button className="button button-red" onClick={()=>setCartOpen(false)}>Explorar produtos <ArrowRight size={16}/></button></div>:<><div className="cart-items">{cart.map(({product,quantity})=><div className="cart-item" key={product.id}><img src={product.image} alt=""/><div className="cart-item-info"><small>{product.category} · {product.brand}</small><strong>{product.name}</strong><span>{money(product.price)}</span><div className="quantity-control"><button onClick={()=>changeQuantity(product.id,-1)}><Minus size={13}/></button><span>{quantity}</span><button onClick={()=>changeQuantity(product.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" onClick={()=>changeQuantity(product.id,-quantity)} aria-label="Remover produto"><X size={15}/></button></div>)}</div><div className="cart-footer"><div className="shipping-free"><Truck size={16}/><span>Parabéns! O frete grátis já está garantido.</span><Check size={15}/></div><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Frete grátis até {date} · estimativa de até 14 dias úteis.</p>{!user&&<p className="auth-needed">Para comprar, você precisa entrar ou criar uma conta.</p>}<button className="button button-red checkout-button" onClick={beginCheckout} disabled={authLoading}>{authLoading?'Verificando sua conta…':user?'Ir para o pagamento':'Entrar e continuar'} <ArrowRight size={17}/></button><button className="continue-shopping" onClick={()=>setCartOpen(false)}><ChevronLeft size={16}/> Continuar comprando</button><div className="payment-logos"><ShieldCheck size={15}/> Pagamento protegido via ComputaFacil <span>PIX · cartão</span></div></div></>}</aside></div>}
    <button className="floating-cart" onClick={()=>setCartOpen(true)} aria-label="Abrir carrinho"><ShoppingBag size={20}/><span>{cart.reduce((n,i)=>n+i.quantity,0)}</span></button>
    {checkoutOpen&&<Checkout cart={cart} total={total} close={()=>setCheckoutOpen(false)} clear={()=>setCart([])}/>}
    {detailProduct&&<ProductDetails product={detailProduct} price={detailPrice} variant={detailVariant} favorite={favorites.includes(detailProduct.id)} close={()=>setDetailProduct(null)} add={()=>add(detailProduct,detailVariant)} toggleFavorite={()=>setFavorites((old)=>old.includes(detailProduct.id)?old.filter((id)=>id!==detailProduct.id):[...old,detailProduct.id])} selectVariant={(size)=>setSelectedStorage((current)=>({...current,[detailProduct.id]:size}))}/>}
    {accountOpen&&<AccountDialog close={()=>{setAccountOpen(false);setCheckoutRequired(false);setPendingCheckout(false)}} onAuthenticated={authenticated} initialMode={accountMode} checkoutRequired={checkoutRequired}/>}
    {cartNotice&&<div className="cart-toast" role="status" aria-live="polite"><span><Check size={17}/></span><strong>{cartNotice}</strong></div>}
  </main>;
}

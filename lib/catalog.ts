export type Category = 'Placas de vídeo' | 'Monitores' | 'Processadores' | 'Memória RAM' | 'Periféricos' | 'Armazenamento';
export type ProductVariant = { size: string; price: number };
export type Product = { id: string; name: string; brand: string; brandIcon: string; category: Category; price: number; oldPrice: number; image: string; badge?: string; detail: string; rating: string; variants?: ProductVariant[]; baseProductId?: string; selectedVariant?: string };
const photo = (id: string, width = 720) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export const categories: { name: Category; icon: string; image: string }[] = [
  { name: 'Placas de vídeo', icon: '◈', image: '/products/asus-dual-geforce-rtx-4060-ti-oc-8gb.webp' },
  { name: 'Monitores', icon: '▣', image: photo('photo-1527443224154-c4a3942d3acf') },
  { name: 'Processadores', icon: '▦', image: photo('photo-1676315487591-7a1d5c02ecae') },
  { name: 'Memória RAM', icon: '▥', image: photo('photo-1562976540-1502c2145186') },
  { name: 'Periféricos', icon: '⌨', image: '/products/logitech-m90-mouse-usb-com-fio.webp' },
  { name: 'Armazenamento', icon: '▤', image: '/products/wd-blue-sn580-m-2-nvme-ssd-250-gb-1-tb.webp' },
];
type ProductGroup = [Category, string[], number[], string, string];
const records: ProductGroup[] = [
  ['Placas de vídeo', ['PNY GeForce RTX 4060 Verto Dual Fan 8GB','ASUS Dual GeForce RTX 4060 Ti OC 8GB','ASUS Dual GeForce RTX 4070 SUPER EVO 12GB','ASUS Dual Radeon RX 7600 OC 8GB','ASUS Dual Radeon RX 7700 XT OC 12GB','ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB'], [1999,2599,3700,1749,2899,5799], 'photo-1591488320449-011701bb6704', 'Nova geração, desempenho de sobra para jogar e criar.'],
  ['Monitores', ['AOC 24G4 Gamer 23.8” IPS 180Hz','LG UltraGear 27GR75Q-B 27” QHD 165Hz','Samsung ViewFinity S5 34” UltraWide','ASUS TUF Gaming VG27UQ1A 27” 4K UHD 160Hz','AOC C32G2E Curvo 31.5” 165Hz','Lenovo ThinkVision M15 Portátil 15.6”','LG UltraGear 25GR75FG-B 24.5” 360Hz'], [799,1399,1199,1999,2099,799,1599], 'photo-1527443224154-c4a3942d3acf', 'Imagem fluida, cores vivas e acabamento premium.'],
  ['Processadores', ['AMD Ryzen 5 5600','AMD Ryzen 5 7600','AMD Ryzen 7 5700X','AMD Ryzen 7 7800X3D','AMD Ryzen 9 7900X','AMD Ryzen 9 7950X','Intel Core i5-12400F','Intel Core i5-14600K','Intel Core i7-14700K','Intel Core i9-14900K','Intel Core Ultra 5 245K','Intel Core Ultra 7 265K'], [499,799,729,1899,1799,2699,559,1249,1799,2399,1399,1999], 'photo-1676315487591-7a1d5c02ecae', 'Potência e eficiência para sua próxima montagem.'],
  ['Memória RAM', ['Kingston Fury Beast DDR4 16GB 3200MHz','Kingston Fury Beast DDR4 32GB 3200MHz','Kingston Fury Beast DDR5 32GB 6000MHz','Corsair Vengeance DDR5 32GB 6000MHz','XPG Lancer RGB DDR5 32GB 6000MHz'], [179,299,499,579,599], 'photo-1562976540-1502c2145186', 'Mais velocidade para multitarefas e jogos.'],
  ['Periféricos', ['Logitech M90 — Mouse USB com fio','Multilaser TC193 — Teclado USB ABNT2','Philips TAUE101BK — Fone com fio e microfone','Logitech G Pro X TKL LIGHTSPEED — Teclado','Razer DeathAdder V3 Pro — Mouse','HyperX Cloud III — Headset','SteelSeries QcK Edge XL — Mousepad','Logitech Brio 500 — Webcam','FIFINE AM8 — Microfone USB','8BitDo Ultimate C — Controle sem fio','JBL Quantum Duo — Caixa de som','Logitech Pebble Keys 2 K380s — Teclado','Logitech MX Master 3S — Mouse sem fio','Razer BlackShark V2 Pro — Headset','Elgato Wave:3 — Microfone Gamer','Logitech G Pro X Superlight 2 — Mouse','Redragon K617 Fizz — Teclado 60%','HyperX Pulsefire Mat XL — Mousepad','North Bayou H100 — Suporte articulado','Anker 565 Docking Station — Dock USB-C'], [30,30,39,299,279,399,99,219,319,259,129,169,399,499,499,449,199,119,179,349], 'photo-1636489910753-1880d26bf218', 'Periféricos de marcas reconhecidas para completar seu setup.'],
];
const iconForBrand: Record<string, string> = {
  NVIDIA: 'nvidia', PNY: 'pny', AMD: 'amd', Intel: 'intel', AOC: 'aoc', LG: 'lg', Samsung: 'samsung', ASUS: 'asus', Lenovo: 'lenovo',
  Kingston: 'kingstontechnology', Corsair: 'corsair', XPG: 'xpg', Logitech: 'logitech', Razer: 'razer', HyperX: 'hyperx', Multi: 'multi', Philips: 'philips',
  SteelSeries: 'steelseries', FIFINE: 'fifine', '8BitDo': '8bitdo', JBL: 'jbl', Anker: 'anker', Elgato: 'elgato', Redragon: 'redragon', Govee: 'govee', 'North Bayou': 'northbayou',
  'Western Digital': 'western-digital', Seagate: 'seagate',
  'T-Dagger': 'tdagger',
};
// Imagens individuais dos modelos identificados (fontes de produto, não fotos genéricas de categoria).
const productImages: Record<string, string> = {
  'ASUS Phoenix Radeon RX 550 2GB': 'https://image.coolblue.nl/500x500/products/809862',
  'AOC LED 19.5” 75Hz': photo('photo-1527443224154-c4a3942d3acf', 800),
  'Kingston ValueRAM DDR3 8GB 1600MHz': photo('photo-1562976540-1502c2145186', 800),
  'Kingston Fury Beast DDR4 8GB 3200MHz': '/products/kingston-fury-beast-ddr4-16gb-3200mhz.webp',
  'Redragon Centrophorus 2 M601-RGB — Mouse gamer': 'https://static.wixstatic.com/media/71a6c2_7f4035495a7e499e99d5d210a40b733f~mv2.png/v1/fill/w_504%2Ch_322%2Cal_c%2Cq_85%2Cenc_avif%2Cquality_auto/1.png',
  'T-Dagger Teclado Gamer RGB ABNT2': 'https://static.wixstatic.com/media/71a6c2_17967830f2ba483eb20e6efd71f37761~mv2.png/v1/fill/w_396%2Ch_388%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/TAURUS%202.png',
  'Redragon Flick P016 — Mousepad estampado': 'https://down-id.img.susercontent.com/file/sg-11134201-7rfh6-m9e5jruta1jtf6',
  'Redragon Ares H120 — Headset gamer': 'https://bluearm.ph/cdn/shop/products/Ares-H120-1.jpg?v=1636091396',
  'PNY GeForce RTX 4060 Verto Dual Fan 8GB': '/products/pny-geforce-rtx-4060-verto-dual-fan-8gb.webp',
  'ASUS Dual GeForce RTX 4060 Ti OC 8GB': '/products/asus-dual-geforce-rtx-4060-ti-oc-8gb.webp',
  'ASUS Dual GeForce RTX 4070 SUPER EVO 12GB': '/products/asus-dual-geforce-rtx-4070-super-evo-12gb.webp',
  'ASUS Dual Radeon RX 7600 OC 8GB': '/products/asus-dual-radeon-rx-7600-oc-8gb.webp',
  'ASUS Dual Radeon RX 7700 XT OC 12GB': '/products/asus-dual-radeon-rx-7700-xt-oc-12gb.webp',
  'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB': '/products/asus-tuf-gaming-geforce-rtx-4070-ti-super-16gb.webp',
  'AOC 24G4 Gamer 23.8” IPS 180Hz': '/products/aoc-24g4-gamer-23-8-ips-180hz.webp',
  'LG UltraGear 27GR75Q-B 27” QHD 165Hz': '/products/lg-ultragear-27gr75q-b-27-qhd-165hz.webp',
  'Samsung ViewFinity S5 34” UltraWide': '/products/samsung-viewfinity-s5-34-ultrawide.webp',
  'ASUS TUF Gaming VG27UQ1A 27” 4K UHD 160Hz': '/products/asus-tuf-gaming-vg27uq1a-27-4k-uhd-160hz.webp',
  'AOC C32G2E Curvo 31.5” 165Hz': '/products/aoc-c32g2e-curvo-31-5-165hz.webp',
  'Lenovo ThinkVision M15 Portátil 15.6”': '/products/lenovo-thinkvision-m15-portatil-15-6.webp',
  'LG UltraGear 25GR75FG-B 24.5” 360Hz': '/products/lg-ultragear-25gr75fg-b-24-5-360hz.jpg',
  'AMD Ryzen 5 5600': '/products/amd-ryzen-5-5600.webp',
  'AMD Ryzen 5 7600': '/products/amd-ryzen-5-7600.webp',
  'AMD Ryzen 7 5700X': '/products/amd-ryzen-7-5700x.webp',
  'AMD Ryzen 7 7800X3D': '/products/amd-ryzen-7-7800x3d.png',
  'AMD Ryzen 9 7900X': '/products/amd-ryzen-9-7900x.webp',
  'AMD Ryzen 9 7950X': '/products/amd-ryzen-9-7950x.webp',
  'Intel Core i5-12400F': '/products/intel-core-i5-12400f.jpg',
  'Intel Core i5-14600K': '/products/intel-core-i5-14600k.webp',
  'Intel Core i7-14700K': '/products/intel-core-i7-14700k.webp',
  'Intel Core i9-14900K': '/products/intel-core-i9-14900k.webp',
  'Intel Core Ultra 5 245K': '/products/intel-core-ultra-5-245k.webp',
  'Intel Core Ultra 7 265K': '/products/intel-core-ultra-7-265k.webp',
  'Kingston Fury Beast DDR4 16GB 3200MHz': '/products/kingston-fury-beast-ddr4-16gb-3200mhz.webp',
  'Kingston Fury Beast DDR4 32GB 3200MHz': '/products/kingston-fury-beast-ddr4-32gb-3200mhz.webp',
  'Kingston Fury Beast DDR5 32GB 6000MHz': '/products/kingston-fury-beast-ddr5-32gb-6000mhz.webp',
  'Corsair Vengeance DDR5 32GB 6000MHz': '/products/corsair-vengeance-ddr5-32gb-6000mhz.webp',
  'XPG Lancer RGB DDR5 32GB 6000MHz': '/products/xpg-lancer-rgb-ddr5-32gb-6000mhz.webp',
  'Logitech M90 — Mouse USB com fio': '/products/logitech-m90-mouse-usb-com-fio.webp',
  'Multilaser TC193 — Teclado USB ABNT2': '/products/multilaser-tc193-teclado-usb-abnt2.webp',
  'Philips TAUE101BK — Fone com fio e microfone': '/products/philips-taue101bk-fone-com-fio-e-microfone.webp',
  'Logitech G Pro X TKL LIGHTSPEED — Teclado': '/products/logitech-g-pro-x-tkl-lightspeed-teclado.webp',
  'Razer DeathAdder V3 Pro — Mouse': '/products/razer-deathadder-v3-pro-mouse.webp',
  'HyperX Cloud III — Headset': '/products/hyperx-cloud-iii-headset.webp',
  'SteelSeries QcK Edge XL — Mousepad': '/products/steelseries-qck-edge-xl-mousepad.webp',
  'Logitech Brio 500 — Webcam': '/products/logitech-brio-500-webcam.webp',
  'FIFINE AM8 — Microfone USB': '/products/fifine-am8-microfone-usb.webp',
  '8BitDo Ultimate C — Controle sem fio': '/products/8bitdo-ultimate-c-controle-sem-fio.webp',
  'JBL Quantum Duo — Caixa de som': '/products/jbl-quantum-duo-caixa-de-som.webp',
  'Logitech Pebble Keys 2 K380s — Teclado': '/products/logitech-pebble-keys-2-k380s-teclado.webp',
  'Logitech MX Master 3S — Mouse sem fio': '/products/logitech-mx-master-3s-mouse-sem-fio.webp',
  'Razer BlackShark V2 Pro — Headset': '/products/razer-blackshark-v2-pro-headset.webp',
  'Elgato Wave:3 — Microfone Gamer': '/products/elgato-wave-3-microfone-gamer.webp',
  'Logitech G Pro X Superlight 2 — Mouse': '/products/logitech-g-pro-x-superlight-2-mouse.webp',
  'Redragon K617 Fizz — Teclado 60%': '/products/redragon-k617-fizz-teclado-60.webp',
  'HyperX Pulsefire Mat XL — Mousepad': '/products/hyperx-pulsefire-mat-xl-mousepad.webp',
  'North Bayou H100 — Suporte articulado': '/products/north-bayou-h100-suporte-articulado.webp',
  'Anker 565 Docking Station — Dock USB-C': '/products/anker-565-docking-station-dock-usb-c.webp',
};
function brandFor(name: string, category: Category): string {
  if (category === 'Placas de vídeo') return name.startsWith('PNY') ? 'PNY' : name.startsWith('ASUS') ? 'ASUS' : name.startsWith('AMD') ? 'AMD' : 'NVIDIA';
  if (category === 'Processadores') return name.startsWith('AMD') ? 'AMD' : 'Intel';
  if (category === 'Armazenamento') return name.startsWith('WD Blue') ? 'Western Digital' : name.startsWith('Seagate') ? 'Seagate' : 'Kingston';
  return Object.keys(iconForBrand).find((brand) => name.startsWith(brand)) ?? 'ComputaFacil';
}
const regularProducts: Product[] = records.flatMap(([category, names, prices, image, detail]) => names.map((name, i) => {
  const brand = brandFor(name, category);
  const oldPrice = category === 'Placas de vídeo' && i === 2 ? 4100 : prices[i];
  return {
    id: `${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
    name, brand, brandIcon: iconForBrand[brand] ?? 'cpu', category, price: category === 'Placas de vídeo' ? Math.round(prices[i] * 0.95) : prices[i], oldPrice,
    image: productImages[name] ?? photo(image, 800), detail,
    ...(i === 2 && category === 'Placas de vídeo' ? { badge: 'Oferta' } : {}),
    rating: '',
  };
}));
const storageProducts: Product[] = [
  { id: 'storage-wd-blue-hdd', name: 'WD Blue 3.5” SATA HDD (1 TB–4 TB)', brand: 'Western Digital', brandIcon: 'western-digital', category: 'Armazenamento', price: 229, oldPrice: 229, image: '/products/wd-blue-3-5-sata-hdd-1-tb-4-tb.webp', detail: 'HD interno para desktop, interface SATA III.', rating: '', variants: [{ size: '1 TB', price: 229 }, { size: '2 TB', price: 309 }, { size: '4 TB', price: 469 }] },
  { id: 'storage-seagate-barracuda-hdd', name: 'Seagate BarraCuda 3.5” SATA HDD (1 TB–4 TB)', brand: 'Seagate', brandIcon: 'seagate', category: 'Armazenamento', price: 239, oldPrice: 239, image: '/products/seagate-barracuda-3-5-sata-hdd-1-tb-4-tb.webp', detail: 'HD interno para desktop, interface SATA III.', rating: '', variants: [{ size: '1 TB', price: 239 }, { size: '2 TB', price: 329 }, { size: '4 TB', price: 489 }] },
  { id: 'storage-kingston-a400-ssd', name: 'Kingston A400 2.5” SATA SSD (120 GB–960 GB)', brand: 'Kingston', brandIcon: 'kingstontechnology', category: 'Armazenamento', price: 79, oldPrice: 79, image: '/products/kingston-a400-2-5-sata-ssd-120-gb-960-gb.webp', detail: 'SSD SATA de 2,5 polegadas para desktop e notebook.', rating: '', variants: [{ size: '120 GB', price: 79 }, { size: '240 GB', price: 109 }, { size: '480 GB', price: 179 }, { size: '960 GB', price: 299 }] },
  { id: 'storage-wd-sn580-ssd', name: 'WD Blue SN580 M.2 NVMe SSD (250 GB–1 TB)', brand: 'Western Digital', brandIcon: 'western-digital', category: 'Armazenamento', price: 139, oldPrice: 139, image: '/products/wd-blue-sn580-m-2-nvme-ssd-250-gb-1-tb.webp', detail: 'SSD NVMe M.2 2280 PCIe 4.0.', rating: '', variants: [{ size: '250 GB', price: 139 }, { size: '500 GB', price: 219 }, { size: '1 TB', price: 369 }] },
];
const budgetAndPromoProducts: Product[] = [
  { id: 'rx550-promotion', name: 'ASUS Phoenix Radeon RX 550 2GB', brand: 'ASUS', brandIcon: 'asus', category: 'Placas de vídeo', price: 229.90, oldPrice: 279.90, image: productImages['ASUS Phoenix Radeon RX 550 2GB'], badge: 'Oferta', detail: 'Placa de vídeo de entrada para jogos leves, e-sports e vídeo. Promoção por menos de R$ 250.', rating: '' },
  { id: 'monitor-199-promo', name: 'AOC LED 19.5” 75Hz', brand: 'AOC', brandIcon: 'aoc', category: 'Monitores', price: 199.90, oldPrice: 279.90, image: productImages['AOC LED 19.5” 75Hz'], badge: 'Só por 3 dias', detail: 'Monitor compacto para estudo, trabalho e setup gamer de entrada. Oferta especial válida por apenas 3 dias.', rating: '' },
  { id: 'ram-ddr3-8gb-promo', name: 'Kingston ValueRAM DDR3 8GB 1600MHz', brand: 'Kingston', brandIcon: 'kingstontechnology', category: 'Memória RAM', price: 89.90, oldPrice: 119.90, image: productImages['Kingston ValueRAM DDR3 8GB 1600MHz'], badge: 'Oferta', detail: 'Módulo DDR3 de 8GB para computadores compatíveis com memória DDR3.', rating: '' },
  { id: 'ram-ddr4-8gb-promo', name: 'Kingston Fury Beast DDR4 8GB 3200MHz', brand: 'Kingston', brandIcon: 'kingstontechnology', category: 'Memória RAM', price: 89.90, oldPrice: 129.90, image: productImages['Kingston Fury Beast DDR4 8GB 3200MHz'], badge: 'Oferta', detail: 'Módulo DDR4 de 8GB para computadores compatíveis com memória DDR4.', rating: '' },
  { id: 'mouse-rgb-under-50', name: 'Redragon Centrophorus 2 M601-RGB — Mouse gamer', brand: 'Redragon', brandIcon: 'redragon', category: 'Periféricos', price: 49.90, oldPrice: 69.90, image: productImages['Redragon Centrophorus 2 M601-RGB — Mouse gamer'], badge: 'Até R$ 50', detail: 'Mouse gamer com iluminação RGB, formato ergonômico e conexão USB.', rating: '' },
  { id: 'keyboard-rgb-under-50', name: 'T-Dagger Teclado Gamer RGB ABNT2', brand: 'T-Dagger', brandIcon: 'tdagger', category: 'Periféricos', price: 49.90, oldPrice: 69.90, image: productImages['T-Dagger Teclado Gamer RGB ABNT2'], badge: 'Até R$ 50', detail: 'Teclado gamer ABNT2 com iluminação RGB e conexão USB.', rating: '' },
  { id: 'mousepad-pattern-under-50', name: 'Redragon Flick P016 — Mousepad estampado', brand: 'Redragon', brandIcon: 'redragon', category: 'Periféricos', price: 29.90, oldPrice: 39.90, image: productImages['Redragon Flick P016 — Mousepad estampado'], badge: 'Até R$ 50', detail: 'Mousepad com estampa gamer, superfície de tecido e base antiderrapante.', rating: '' },
  { id: 'headset-under-50', name: 'Redragon Ares H120 — Headset gamer', brand: 'Redragon', brandIcon: 'redragon', category: 'Periféricos', price: 49.90, oldPrice: 69.90, image: productImages['Redragon Ares H120 — Headset gamer'], badge: 'Até R$ 50', detail: 'Headset com microfone integrado para jogos, chamadas e uso diário.', rating: '' },
];
export const products: Product[] = [...regularProducts, ...storageProducts, ...budgetAndPromoProducts];
export const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

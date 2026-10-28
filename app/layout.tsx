import type { Metadata } from 'next';
import './styles.css';
export const metadata: Metadata = { title: 'ComputaFacil | Tecnologia que cabe no seu setup', description: 'Hardware, periféricos e acessórios para o seu próximo upgrade. Frete grátis até 04/11.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }

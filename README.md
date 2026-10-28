# ComputaFacil

Loja de hardware construída com Next.js, Neon Auth e pagamentos Blackcat.

## Executar localmente

1. Instale Node.js 20 ou superior.
2. Rode `npm install` e `npm run dev`.
3. Configure as variáveis de Neon e Blackcat no `.env.local` (veja `.env.example`).

## Publicar na Vercel

Importe este repositório na Vercel. O framework Next.js é detectado automaticamente. Em **Project → Settings → Environment Variables**, configure `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `BLACKCAT_API_KEY` e `NEXT_PUBLIC_SITE_URL` com seus valores reais. Faça um novo deploy após salvar as variáveis.

O segredo Blackcat fica apenas nas rotas de servidor. Produtos e preços são recalculados pelo catálogo do servidor. O checkout exige uma sessão Neon válida, coleta endereço, telefone e CPF, registra o pedido no Postgres, e só então solicita o pagamento PIX ou cartão à Blackcat. CVV e número do cartão nunca são gravados no banco. A consulta de status exige que o pedido pertença à conta autenticada. O webhook confirma o status consultando a Blackcat e sincroniza o pedido de forma idempotente.

`neon.ts` declara Neon Auth (Postgres é o serviço base). Depois de autenticar na organização correta, execute `neon init -y --org-id ... --project-id ... --branch production --services postgres --services auth` e `neon deploy` para obter as variáveis no `.env.local`. O cookie secret é da aplicação; gere um valor aleatório com pelo menos 32 caracteres. A chave Blackcat precisa ser configurada separadamente. Sem essas variáveis, a loja abre para navegação, mas login, banco e pagamento ficam desabilitados — compras nunca são simuladas.

## Ativação real

Integração real exige acesso ao projeto Neon indicado, as variáveis de Neon, chave Blackcat e domínio público HTTPS. Nunca publique segredos no frontend.

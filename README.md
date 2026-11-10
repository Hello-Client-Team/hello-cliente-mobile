# Hello Cliente — Pocket Hub (app do lojista)

App React Native (Expo SDK 58, Expo Router, TypeScript) para o lojista acessar
os sistemas adotados na plataforma Hello Cliente. Consome a mesma API do
frontend web.

## Funcionalidades

- Login do lojista com WhatsApp e senha (`POST /auth/login`).
- "Meus sistemas": adoções ativas e revogações (`GET /merchant/matches`).
- "Abrir": abre o sistema do desenvolvedor no navegador interno do celular
  (Chrome Custom Tabs / SFSafariViewController, via `expo-web-browser`).
- "Revogar acesso": confirmação e registro da revogação
  (`POST /merchant/matches/:id/revoke`), com acompanhamento do prazo de exclusão.

Cadastro, vitrine e adoção continuam no site; o link "Cadastre seu negócio"
abre o site no navegador interno.

## Executar

Copie `.env.example` para `.env.local` e ajuste os endereços:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3333
EXPO_PUBLIC_WEB_URL=http://localhost:3000
```

- Emulador Android: use `http://10.0.2.2:3333` como URL da API.
- Celular físico com Expo Go: use o IP do computador na rede local.
- `EXPO_PUBLIC_WEB_URL` precisa constar em `CORS_ORIGINS` no backend.

```bash
npm install
npx expo start
```

Para a versão web (`npx expo start --web`), inclua também
`http://localhost:8081` em `CORS_ORIGINS`.

## Sessão

O access token fica apenas em memória. O refresh token é o cookie HttpOnly
`hc_refresh`, guardado pelo armazenamento de cookies nativo do sistema; ao abrir
o app a sessão é restaurada por `POST /auth/refresh`. A renovação é serializada
porque o backend rotaciona o refresh token a cada uso.

O backend exige um `Origin` autorizado nos POSTs de autenticação. Clientes
nativos não enviam esse cabeçalho, então o app envia `EXPO_PUBLIC_WEB_URL`.
Em produção o cookie é `Secure`: a API precisa estar em HTTPS.

## Organização

- `src/app/`: rotas — `_layout.tsx` (sessão e proteção de rotas), `entrar.tsx`, `index.tsx`.
- `src/providers/session-provider.tsx`: usuário autenticado, login e logout.
- `src/services/api.ts`: transporte, erros, paginação e renovação de sessão.
- `src/hooks/use-matches.ts`: adoções do lojista e revogação.
- `src/components/`: botão, marca, cartão de sistema e diálogo de revogação.

## Verificar

```bash
npm run typecheck
npm run lint
```

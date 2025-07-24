export const corsConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const client_app_url =
    process.env.CLIENT_APP_URL || 'app.cotareconstruir.com';

  const corsOptions = {
    development: {
      origin: '*', // Permitir todas as origens no ambiente de desenvolvimento
      methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTION',
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    production: {
      origin: [client_app_url], // Domínio da aplicação em produção
      methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTION',
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return corsOptions[env] || corsOptions.development;
};

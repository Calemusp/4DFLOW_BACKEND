export const envConfig = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  igss: {
    host: process.env.IGSS_SOAP_HOST ?? 'servicios.igssgt.org',
    path:
      process.env.IGSS_SOAP_PATH ??
      '/WServices/WsLabMediIGSS/WsLabMediIGSS.asmx',
    soapUser: process.env.IGSS_SOAP_USER ?? 'WsConsultaLabs',
    soapPassword: process.env.IGSS_SOAP_PASSWORD ?? 'Igss.ws2020',
    timeoutMs: parseInt(process.env.IGSS_SOAP_TIMEOUT_MS ?? '20000', 10),
  },
  databases: {
    fourDService: {
      host: process.env.DB_4DSERVICE_HOST,
      port: parseInt(process.env.DB_4DSERVICE_PORT ?? '1433', 10),
      username: process.env.DB_4DSERVICE_USER,
      password: process.env.DB_4DSERVICE_PASSWORD,
      name: process.env.DB_4DSERVICE_NAME,
    },
    fourDLab: {
      host: process.env.DB_4DLAB_HOST,
      port: parseInt(process.env.DB_4DLAB_PORT ?? '1433', 10),
      username: process.env.DB_4DLAB_USER,
      password: process.env.DB_4DLAB_PASSWORD,
      name: process.env.DB_4DLAB_NAME,
    },
  },
});

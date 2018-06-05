import { environment } from '@environment';

// noinspection JSUnusedGlobalSymbols
export const jwtOptionsFactory = () => ({
  whitelistedDomains: [environment.baseUrl],
  blacklistedDomains: [environment.baseUrl + '/user/login'],
  tokenGetter: () => localStorage.getItem(environment.tokenName),
  authScheme: '',
});

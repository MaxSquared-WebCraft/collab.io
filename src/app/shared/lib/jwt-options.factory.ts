import { environment } from '../../../environments/environment';

export const jwtOptionsFactory = () => ({
  whitelistedDomains: [environment.baseUrl],
  blacklistedDomains: [environment.baseUrl + '/user/login'],
  tokenGetter: () => localStorage.getItem(environment.tokenName),
  authScheme: '',
});

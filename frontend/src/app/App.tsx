import { Providers } from '@app/providers';
import { AppRouter } from '@app/router';
import { wireSession } from '@app/session';

wireSession();

export const App = () => (
  <Providers>
    <AppRouter />
  </Providers>
);

import { DatabaseService, UserProfile } from './Database';

let cachedUser: UserProfile | null = null;

export const CurrentUser = {
  ensure(seed?: Partial<UserProfile>): UserProfile {
    if (!cachedUser) {
      const username = seed?.username || 'local_user';
      // Ensure we have an id by selecting after insert
      DatabaseService.getOrCreateUser(username, seed?.display_name || 'Local User', (row) => {
        cachedUser = row;
      });
      // Fallback cached shape while async select resolves
      cachedUser = { username, display_name: seed?.display_name || 'Local User' } as UserProfile;
    }
    return cachedUser!;
  },
  get(): UserProfile {
    return this.ensure();
  },
  set(user: UserProfile): void {
    cachedUser = user;
    DatabaseService.upsertUser(user);
  },
};



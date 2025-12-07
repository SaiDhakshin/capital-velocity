
export interface User {
  id: string;
  email: string;
  name: string;
  title?: string;
}

const USERS_DB_KEY = 'cv_users_db';
const SESSION_KEY = 'cv_session_user';

class AuthService {
  private getUsers(): User[] {
    const usersStr = localStorage.getItem(USERS_DB_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  private saveUser(user: User & { password?: string }) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  // Simulate a DB lookup
  async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network lag

    const users = this.getUsers();
    // In a real app, never store plain text passwords. This is a mock DB.
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      const { password, ...safeUser } = user as any;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return safeUser;
    }
    throw new Error('Invalid credentials');
  }

  async register(email: string, password: string, name: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      password, // Stored for mock auth purposes
      title: 'Cashflow Builder'
    };

    this.saveUser(newUser);
    
    const { password: p, ...safeUser } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
  
  async updateProfile(user: User): Promise<User> {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
          // Merge updates, keeping the password
          const existing = users[idx] as any;
          users[idx] = { ...existing, ...user };
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          return user;
      }
      throw new Error("User not found");
  }
}

export const authService = new AuthService();

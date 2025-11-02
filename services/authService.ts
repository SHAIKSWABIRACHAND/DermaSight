import { Role, User as UserProfile } from '../types';

export interface User extends UserProfile {
  password?: string; // Only for storage, don't return to client
  resetCode?: string; // For password reset functionality
  resetCodeExpiry?: number; // Timestamp when the reset code expires
}

const USERS_STORAGE_KEY = 'dermasight-users';
const CURRENT_USER_SESSION_KEY = 'dermasight-current-user';

// Helper to get all users (simulates a database)
const getUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    return [];
  }
};

// Helper to save all users
const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage", error);
  }
};

// --- Password Reset Functions ---

export const requestPasswordReset = async (email: string, role: Role): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
      
      if (!user) {
        return reject(new Error(`No ${role} account found with this email address.`));
      }

      // Generate a 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

      // Update user with reset code
      const updatedUsers = users.map(u => 
        u.email === email ? { ...u, resetCode, resetCodeExpiry } : u
      );
      saveUsers(updatedUsers);

      // In a real application, send this code via email
      console.log(`Reset code for ${email}: ${resetCode}`);
      
      resolve();
    }, 1000);
  });
};

export const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return reject(new Error('Invalid email address.'));
      }

      if (!user.resetCode || user.resetCode !== resetCode) {
        return reject(new Error('Invalid reset code.'));
      }

      if (!user.resetCodeExpiry || user.resetCodeExpiry < Date.now()) {
        return reject(new Error('Reset code has expired. Please request a new one.'));
      }

      // Update user's password and remove reset code
      const updatedUsers = users.map(u => 
        u.email === email 
          ? { ...u, password: newPassword, resetCode: undefined, resetCodeExpiry: undefined }
          : u
      );
      saveUsers(updatedUsers);
      
      resolve();
    }, 1000);
  });
};

// --- Public API ---

export const register = async (name: string, email: string, password: string, role: Role, licenseNumber?: string, dateOfBirth?: string): Promise<Omit<User, 'password'>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const users = getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return reject(new Error("A user with this email already exists."));
      }
      
      const newUser: User = { name, email: email.toLowerCase(), password, role };
      if (role === 'doctor' && licenseNumber) {
        newUser.licenseNumber = licenseNumber;
      }
      if (role === 'patient' && dateOfBirth) {
        newUser.dateOfBirth = dateOfBirth;
      }
      users.push(newUser);
      saveUsers(users);

      const { password: _, ...userToReturn } = newUser;
      return resolve(userToReturn);
    }, 500);
  });
};

export const login = async (email: string, password: string): Promise<Omit<User, 'password'>> => {
   return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        return reject(new Error("Invalid email or password."));
      }
      
      const { password: _, ...userToReturn } = user;
      return resolve(userToReturn);
    }, 500);
  });
};

export const saveCurrentUser = (user: Omit<User, 'password'>) => {
  try {
    localStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save current user session", error);
  }
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
   try {
    const sessionUser = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    return sessionUser ? JSON.parse(sessionUser) : null;
  } catch (error) {
    console.error("Failed to get current user session", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_SESSION_KEY);
};

export const updateCurrentUser = async (originalEmail: string, updatedProfile: { name: string; email: string }): Promise<Omit<User, 'password'>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === originalEmail.toLowerCase());

      if (userIndex === -1) {
        return reject(new Error("Current user not found in database. Could not update profile."));
      }

      // If email is being changed, check if the new email is already taken by another user
      const newEmailLower = updatedProfile.email.toLowerCase();
      if (originalEmail.toLowerCase() !== newEmailLower) {
          const existingUserWithNewEmail = users.find(u => u.email.toLowerCase() === newEmailLower);
          if (existingUserWithNewEmail) {
              return reject(new Error("This email address is already in use by another account."));
          }
      }

      const originalUser = users[userIndex];
      const updatedUser: User = {
        ...originalUser,
        name: updatedProfile.name,
        email: updatedProfile.email,
      };

      users[userIndex] = updatedUser;
      saveUsers(users);
      
      const { password: _, ...userToReturn } = updatedUser;
      saveCurrentUser(userToReturn); // Update the active session
      
      return resolve(userToReturn);
    }, 500);
  });
};
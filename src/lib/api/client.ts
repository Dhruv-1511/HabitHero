/**
 * Centralized API client with error handling and type safety
 */

// Types for API responses
interface User {
  id: string;
  email: string;
}

interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  weekly_goal: number;
  reminder_time: string | null;
  created_at: string;
  completions?: Completion[];
}

interface Completion {
  id: string;
  habit_id: string;
  date: string;
  note: string | null;
  created_at: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<{ user: User }> {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ user: User }> {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Logout current user
   */
  async logout(): Promise<{ success: boolean }> {
    return apiFetch('/api/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current user session
   */
  async me(): Promise<{ user: User | null }> {
    return apiFetch('/api/auth/me');
  },
};

/**
 * Habits API methods
 */
export const habitsApi = {
  /**
   * List all habits for current user
   */
  async list(): Promise<{ habits: Habit[] }> {
    return apiFetch('/api/habits');
  },

  /**
   * Get a single habit by ID
   */
  async get(id: string): Promise<{ habit: Habit }> {
    return apiFetch(`/api/habits/${id}`);
  },

  /**
   * Create a new habit
   */
  async create(habit: {
    name: string;
    icon: string;
    color: string;
    category: string;
    weeklyGoal?: number;
    reminderTime?: string;
  }): Promise<{ habit: Habit }> {
    return apiFetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habit),
    });
  },

  /**
   * Update an existing habit
   */
  async update(
    id: string,
    updates: {
      name?: string;
      icon?: string;
      color?: string;
      category?: string;
      weekly_goal?: number;
      reminder_time?: string;
    }
  ): Promise<{ habit: Habit }> {
    return apiFetch(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a habit
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/habits/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Completions API methods
 */
export const completionsApi = {
  /**
   * Toggle a completion (create or delete)
   */
  async toggle(habitId: string, date: string, note?: string): Promise<{ completion?: Completion; deleted?: boolean }> {
    // Try to create completion first
    try {
      const result = await apiFetch(`/api/habits/${habitId}/completions`, {
        method: 'POST',
        body: JSON.stringify({ date, note }),
      });
      return { completion: result };
    } catch (error) {
      // If already exists, delete it instead
      if (error instanceof Error && error.message.includes('already completed')) {
        await apiFetch(`/api/habits/${habitId}/completions?date=${date}`, {
          method: 'DELETE',
        });
        return { deleted: true };
      }
      throw error;
    }
  },

  /**
   * Create a completion
   */
  async create(habitId: string, date: string, note?: string): Promise<{ completion: Completion }> {
    return apiFetch(`/api/habits/${habitId}/completions`, {
      method: 'POST',
      body: JSON.stringify({ date, note }),
    });
  },

  /**
   * Delete a completion
   */
  async delete(habitId: string, date: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/habits/${habitId}/completions?date=${date}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get completion history
   */
  async history(
    habitId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    completions: Completion[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options?.startDate) params.set('startDate', options.startDate);
    if (options?.endDate) params.set('endDate', options.endDate);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/api/habits/${habitId}/history${query}`);
  },
};

/**
 * Migration API methods
 */
export const migrationApi = {
  /**
   * Migrate localStorage habits to database
   */
  async migrateHabits(habits: unknown[]): Promise<{
    migratedCount: number;
    habits: Habit[];
    errors?: Array<{ habitName: string; error: string }>;
  }> {
    return apiFetch('/api/migrate', {
      method: 'POST',
      body: JSON.stringify({ habits }),
    });
  },
};

// Export all APIs as a single object
export const api = {
  auth: authApi,
  habits: habitsApi,
  completions: completionsApi,
  migration: migrationApi,
};

export default api;

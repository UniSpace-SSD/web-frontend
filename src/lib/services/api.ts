const API_BASE_URL = 'http://127.0.0.1:8000/api';

export type Department = 'DEMACS' | 'DIMES' | 'DIMEG' | 'DIAM' | 'DICES';
export const DEPARTMENTS: Department[] = ['DEMACS', 'DIMES', 'DIMEG', 'DIAM', 'DICES'];

export interface User {
	pk: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	date_of_birth: string;
	role: 'student' | 'professor';
	department: Department;
	is_superuser: boolean;
}

export interface LoginRequest {
	username?: string;
	email?: string;
	password: string;
}

export interface LoginResponse {
	key: string;
}

export interface RegisterRequest {
	username: string;
	email: string;
	password1: string;
	password2: string;
	first_name: string;
	last_name: string;
	date_of_birth: string;
	role: 'student' | 'professor';
	department: Department;
}

export interface Building {
	id: string;
	name: string;
	address: string;
	department: Department;
}

export interface Equipment {
	id: number;
	name: string;
	description?: string;
}

export interface Space {
	id: string;
	name: string;
	type: 'ROOM' | 'LAB' | 'AUDITORIUM' | 'MEETING_ROOM' | 'LIBRARY';
	building?: Building;
	building_id?: string;
	floor?: number;
	capacity: number;
	equipments?: Equipment[];
	equipment_ids?: number[];
	department?: string;
}

export interface Reservation {
	id: string;
	space: string;
	created_by?: string;
	header?: string;
	start_at: string;
	end_at: string;
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
	created_at?: string;
	updated_at?: string;
}


class ApiClient {
	private baseUrl: string;
	private token: string | null = null;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
		if (typeof window !== 'undefined') {
			this.token = localStorage.getItem('auth_token');
		}
	}

	setToken(token: string | null) {
		this.token = token;
		if (typeof window !== 'undefined') {
			if (token) {
				localStorage.setItem('auth_token', token);
			} else {
				localStorage.removeItem('auth_token');
			}
		}
	}

	getToken(): string | null {
		return this.token;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>),
		};

		if (this.token) {
			headers['Authorization'] = `Token ${this.token}`;
		}

		const config: RequestInit = { ...options, headers };

		try {
			const response = await fetch(url, config);

			if (response.status === 204) {
				return {} as T;
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || data.message || data.error || 'API request failed');
			}

			return data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	// Auth Endpoints
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		const response = await this.request<LoginResponse>('/auth/login/', {
			method: 'POST',
			body: JSON.stringify(credentials),
		});
		this.setToken(response.key);
		return response;
	}

	async register(data: RegisterRequest): Promise<any> {
		return this.request('/auth/registration/', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async logout(): Promise<void> {
		await this.request('/auth/logout/', { method: 'POST' });
		this.setToken(null);
	}

	async getCurrentUser(): Promise<User> {
		return this.request<User>('/auth/user/');
	}

	async updateUser(data: Partial<User>): Promise<User> {
		return this.request<User>('/auth/user/', {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}

	// Buildings Endpoints
	async getBuildings(): Promise<Building[]> {
		return this.request<Building[]>('/buildings/');
	}

	async getBuilding(id: string): Promise<Building> {
		return this.request<Building>(`/buildings/${id}/`);
	}

	async createBuilding(data: Omit<Building, 'id'>): Promise<Building> {
		return this.request<Building>('/buildings/', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
		return this.request<Building>(`/buildings/${id}/`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteBuilding(id: string): Promise<void> {
		return this.request<void>(`/buildings/${id}/`, {
			method: 'DELETE',
		});
	}

	// Spaces Endpoints
	async getSpaces(): Promise<Space[]> {
		return this.request<Space[]>('/spaces/');
	}

	async getSpace(id: string): Promise<Space> {
		return this.request<Space>(`/spaces/${id}/`);
	}

	async createSpace(data: Omit<Space, 'id'>): Promise<Space> {
		return this.request<Space>('/spaces/', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateSpace(id: string, data: Partial<Space>): Promise<Space> {
		return this.request<Space>(`/spaces/${id}/`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteSpace(id: string): Promise<void> {
		return this.request<void>(`/spaces/${id}/`, {
			method: 'DELETE',
		});
	}

	// Reservations Endpoints
	async getReservations(): Promise<Reservation[]> {
		return this.request<Reservation[]>('/reservations/');
	}

	async getMyReservations(): Promise<Reservation[]> {
		return this.request<Reservation[]>('/reservations/me/');
	}

	async getReservation(id: string): Promise<Reservation> {
		return this.request<Reservation>(`/reservations/${id}/`);
	}

	async createReservation(data: Omit<Reservation, 'id' | 'status' | 'created_at' | 'updated_at' | 'created_by'>): Promise<Reservation> {
		return this.request<Reservation>('/reservations/', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async confirmReservation(id: string): Promise<Reservation> {
		return this.request<Reservation>(`/reservations/${id}/confirm/`, {
			method: 'PATCH',
		});
	}

	async cancelReservation(id: string): Promise<Reservation> {
		return this.request<Reservation>(`/reservations/${id}/cancel/`, {
			method: 'PATCH',
		});
	}

	async getReservationsBySpace(spaceId: string): Promise<Reservation[]> {
		return this.request<Reservation[]>(`/reservations/space/${spaceId}/`);
	}

	// Equipments Endpoints
	async getEquipments(): Promise<Equipment[]> {
		return this.request<Equipment[]>('/equipments/');
	}

	async getEquipment(id: number): Promise<Equipment> {
		return this.request<Equipment>(`/equipments/${id}/`);
	}

	async createEquipment(data: Omit<Equipment, 'id'>): Promise<Equipment> {
		return this.request<Equipment>('/equipments/', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateEquipment(id: number, data: Partial<Equipment>): Promise<Equipment> {
		return this.request<Equipment>(`/equipments/${id}/`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}
}

export const api = new ApiClient(API_BASE_URL);
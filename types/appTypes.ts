export type Volunteer = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    skills?: string;
    areaId?: string | null;
  };
  
  export type Area = {
    id: string;
    name: string;
    cep: string;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  
  export type Donation = {
    id: string;
    description: string;
    quantity: number;
    areaId?: string | null;
  };
  
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  isUpcoming: boolean;
  category: string;
}

export interface Member {
  id: string;
  auth_id?: string;
  name: string;
  email?: string;
  role?: string;
  company?: string;
  bio?: string;
  image_url?: string;
  linkedin?: string;
  expertise?: string[];
  year_joined?: number;
}

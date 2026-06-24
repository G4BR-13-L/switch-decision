export interface Store {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  site?: string;
  isReliable: boolean; // Confiavel > Nao confiavel
}

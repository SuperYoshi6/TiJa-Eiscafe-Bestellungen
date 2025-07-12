export interface IceCreamFlavor {
  name: string;
  scoops: number;
}

export interface Order {
  id?: string;
  customerName: string;
  flavors: IceCreamFlavor[];
  toppings: string[];
  drinks: string[];
  coffeeType?: string;
  remarks: string;
  createdAt: string;
  drinksOnly?: boolean;
}

export interface OrderFormData {
  customerName: string;
  chocolate: number;
  vanilla: number;
  stracciatella: number;
  toppings: string[];
  drinks: string[];
  coffeeType: string;
  remarks: string;
}
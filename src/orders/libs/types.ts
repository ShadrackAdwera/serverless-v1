type TProductItems = {
  quantity: number;
  price: number;
  productId: string;
  productName: string;
};

export type TOrder = {
  orderDate?: string;
  username: string;
  totalPrice: number;
  firstName?: string;
  lastName?: string;
  email: string;
  address: string;
  cardInfo: string;
  paymentMethod: string;
  items: TProductItems;
};

export interface UserData extends Document {
    name: string;
    description:string;
    image:string;
    category:string;
    catDiscont:number;
    prodDiscont:number;
    price:number
  }
// types.ts
export interface User {
    id: number;
    username: string;
    name: string;
    createdAt: string;
  }
  
  export interface Email {
    id: number;
    from: string;
    to: string;
    subject: string;
    body: string;
    createdAt: string;
    read: boolean;
    status: string;
    updatedAt: string;
  }
  
  export interface DashboardStats {
    sent: number;
    users: number;
    trash: number;
  }
export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "pending" | "disabled";
  balance: number;
};

export const users: User[] = [
  {
    id: "usr_001",
    name: "Nima Rahmati",
    email: "nima@example.com",
    role: "admin",
    status: "active",
    balance: 12500,
  },
  {
    id: "usr_002",
    name: "Ali Ahmadi",
    email: "ali@example.com",
    role: "user",
    status: "pending",
    balance: 8400,
  },
  {
    id: "usr_003",
    name: "Sara Mohammadi",
    email: "sara@example.com",
    role: "moderator",
    status: "active",
    balance: 15200,
  },
  {
    id: "usr_004",
    name: "Reza Karimi",
    email: "reza@example.com",
    role: "user",
    status: "disabled",
    balance: 3200,
  },
  {
    id: "usr_005",
    name: "Maryam Hosseini",
    email: "maryam@example.com",
    role: "user",
    status: "active",
    balance: 9800,
  },
];

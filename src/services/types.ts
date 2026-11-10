export interface User {
  id: string;
  name: string;
  role: 'MERCHANT' | 'DEVELOPER' | 'ADMIN';
  email?: string | null;
  merchant?: { businessName: string } | null;
}

export interface Revocation {
  id: string;
  status: string;
  requestedAt: string;
  deletionDeadlineAt: string;
  deletionDeclaredAt: string | null;
  notificationAcceptedAt: string | null;
}

export interface Match {
  id: string;
  projectId: string;
  status: 'ACTIVE' | 'REVOKED';
  adoptedAt: string;
  productionUrlSnapshot: string;
  project: {
    id: string;
    title: string;
    category: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    developer: { id: string; name: string };
  };
  revocation: Revocation | null;
}

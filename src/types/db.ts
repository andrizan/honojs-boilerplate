interface PostgreSQLErrorCause {
  length: number;
  name: string;
  severity: string;
  code: string;
  detail: string;
  schema: string;
  table: string;
  constraint: string;
  file: string;
  line: string;
  routine: string;
}

export interface DatabaseError {
  query: string;
  params: any[];
  cause: PostgreSQLErrorCause;
}

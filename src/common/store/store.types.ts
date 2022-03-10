export interface IRepository<T> {
  keyPrefix: string;
  findById: (id: string) => Promise<T>;
  insert: (entity: T, echoId?: boolean) => Promise<boolean | string>;
  delete: (id: string) => Promise<boolean>;
  list?: () => Promise<Array<T>>;
  update?: (id: string, entity: Partial<T>) => Promise<boolean>;
}

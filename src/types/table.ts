export type ForeignKeyOrReferencedByItemType = {
  columnName: string;
  constraintName: string;
  tableName: string;
  tableLabel?: string;
  relColumnName: string;
  relTableName: string;
  relTableLabel: string;
};

export type ColumnItemType = {
  name: string;
  label: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  foreignKeys: ForeignKeyOrReferencedByItemType[];
  referencedBy: ForeignKeyOrReferencedByItemType[];
  default: string;
};

export type ViewItemType = {
  name: string;
  state: any;
  orderBy: string;
  limit: number;
  offset: string;
};

export type TableItemType = {
  name: string;
  label: string;
  columns: ColumnItemType[];
  role: {
    name: string;
  };
  settings: {
    views: ViewItemType[];
    defaultView: string;
  };
};

export type ForeignKeyItemType = {
  columnName: string;
  constraintName: string;
  tableName: string;
  relColumnName: string;
  relTableName: string;
};

export type ReferencedByItemType = {
  columnName: string;
  constraintName: string;
  tableName: string;
  relColumnName: string;
  relTableName: string;
};

export type ColumnItemType = {
  name: string;
  label: string;
  type: string;
  isPrimaryKey: boolean;
  foreignKeys: Array<ForeignKeyItemType>;
  referencedBy: Array<ReferencedByItemType>;
};

export type TableItemType = {
  name: string;
  label: string;
  columns: Array<ColumnItemType>;
  role: {
    name: string;
  };
};

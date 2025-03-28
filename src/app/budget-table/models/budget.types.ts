export interface BaseItem {
  name: string;
  values: { [key: string]: number };
}

export interface BaseCategory {
  name: string;
  items: BaseItem[];
  isDefault?: boolean;
  values: { [key: string]: number };
}

export type IncomeItem = BaseItem;
export type ExpenseItem = BaseItem;
export type IncomeCategory = BaseCategory;
export type ExpenseCategory = BaseCategory;

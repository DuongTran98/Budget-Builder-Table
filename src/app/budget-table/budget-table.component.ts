import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface IncomeItem {
  name: string;
  values: { [key: string]: number };
}

interface IncomeCategory {
  name: string;
  items: IncomeItem[];
  isDefault?: boolean;
  values: { [key: string]: number };  // Add values to parent category
}

interface ExpenseItem {
  name: string;
  values: { [key: string]: number };
}

interface ExpenseCategory {
  name: string;
  items: ExpenseItem[];
  isDefault?: boolean;
  values: { [key: string]: number };
}

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-table.component.html'
})
export class BudgetTableComponent implements OnInit {
  months: string[] = [];
  incomeCategories: IncomeCategory[] = [];
  expenseCategories: ExpenseCategory[] = [];
  selectedCell: { rowIndex: number, colIndex: number } | null = null;
  startDate: Date = new Date(2024, 0, 1); // Default to January 2024
  endDate: Date = new Date(2024, 11, 31); // Default to December 2024

  constructor() {
  }

  ngOnInit() {
    this.initializeMonths();
    this.initializeIncome();
    this.initializeExpenses();
  }

  updateDateRange(event: any, isStartDate: boolean) {
    const date = new Date(event.target.value);
    if (isStartDate) {
      this.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    } else {
      this.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    // Validate date range
    if (this.startDate > this.endDate) {
      if (isStartDate) {
        this.startDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 1);
      } else {
        this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 0);
      }
    }

    this.resetData();
  }

  private resetData() {
    // Save existing data
    const existingData = [...this.incomeCategories];
    
    // Reset months
    this.initializeMonths();

    // Initialize new monthValues
    const newMonthValues: { [key: string]: number } = {};
    this.months.forEach(month => newMonthValues[month] = 0);

    // Update existing categories with new month structure
    this.incomeCategories = existingData.map(category => ({
      ...category,
      values: { ...newMonthValues },
      items: category.items.map(item => ({
        ...item,
        values: { ...newMonthValues }
      }))
    }));

    // Reset expenses
    const existingExpenses = [...this.expenseCategories];
    this.expenseCategories = existingExpenses.map(category => ({
      ...category,
      values: { ...newMonthValues },
      items: category.items.map(item => ({
        ...item,
        values: { ...newMonthValues }
      }))
    }));
  }

  getFormattedDate(date: Date): string {
    return date.toISOString().substring(0, 7); // Returns YYYY-MM format
  }

  private initializeMonths() {
    this.months = [];
    let currentDate = new Date(this.startDate);
    while (currentDate <= this.endDate) {
      this.months.push(currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
  }

  private initializeIncome() {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);

    this.incomeCategories = [
      {
        name: 'General Income',
        isDefault: true,
        values: { ...monthValues },
        items: [
          { name: 'Sales', values: { ...monthValues } },
          { name: 'Commissions', values: { ...monthValues } }
        ]
      },
      {
        name: 'Other Income',
        isDefault: true,
        values: { ...monthValues },
        items: [
          { name: 'Training', values: { ...monthValues } },
          { name: 'Consulting', values: { ...monthValues } }
        ]
      }
    ];
  }

  private initializeExpenses() {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);

    this.expenseCategories = [
      {
        name: 'Fixed Expenses',
        isDefault: true,
        values: { ...monthValues },
        items: [
          { name: 'Rent', values: { ...monthValues } },
          { name: 'Utilities', values: { ...monthValues } }
        ]
      },
      {
        name: 'Variable Expenses',
        isDefault: true,
        values: { ...monthValues },
        items: [
          { name: 'Marketing', values: { ...monthValues } },
          { name: 'Office Supplies', values: { ...monthValues } }
        ]
      }
    ];
  }

  addNewCategory(categoryIndex: number) {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);
    
    this.incomeCategories[categoryIndex].items.push({
      name: 'New Item',
      values: monthValues
    });
  }

  addNewParentCategory() {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);
    
    this.incomeCategories.push({
      name: 'New Income Category',
      isDefault: false,
      values: monthValues,
      items: []
    });
  }

  addNewExpenseCategory() {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);
    
    this.expenseCategories.push({
      name: 'New Expense Category',
      isDefault: false,
      values: monthValues,
      items: []
    });
  }

  addNewExpenseItem(categoryIndex: number) {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);
    
    this.expenseCategories[categoryIndex].items.push({
      name: 'New Expense',
      values: monthValues
    });
  }

  deleteItem(categoryIndex: number, itemIndex: number) {
    this.incomeCategories[categoryIndex].items.splice(itemIndex, 1);
  }

  deleteExpenseItem(categoryIndex: number, itemIndex: number) {
    this.expenseCategories[categoryIndex].items.splice(itemIndex, 1);
  }

  updateValue(categoryIndex: number, itemIndex: number, month: string, value: number) {
    this.incomeCategories[categoryIndex].items[itemIndex].values[month] = value;
  }

  updateParentValue(categoryIndex: number, month: string, value: number) {
    this.incomeCategories[categoryIndex].values[month] = value;
  }

  updateExpenseValue(categoryIndex: number, itemIndex: number, month: string, value: number) {
    this.expenseCategories[categoryIndex].items[itemIndex].values[month] = value;
  }

  updateExpenseParentValue(categoryIndex: number, month: string, value: number) {
    this.expenseCategories[categoryIndex].values[month] = value;
  }

  getCategoryMonthTotal(categoryIndex: number, month: string): number {
    const parentValue = this.incomeCategories[categoryIndex].values[month] || 0;
    const itemsTotal = this.incomeCategories[categoryIndex].items
      .reduce((sum, item) => sum + (item.values[month] || 0), 0);
    return parentValue + itemsTotal;
  }

  getExpenseCategoryMonthTotal(categoryIndex: number, month: string): number {
    const parentValue = this.expenseCategories[categoryIndex].values[month] || 0;
    const itemsTotal = this.expenseCategories[categoryIndex].items
      .reduce((sum, item) => sum + (item.values[month] || 0), 0);
    return parentValue + itemsTotal;
  }

  getAllCategoriesMonthTotal(month: string): number {
    return this.incomeCategories.reduce((sum, category) => {
      const parentValue = category.values[month] || 0;
      const itemsTotal = category.items.reduce((itemSum, item) => 
        itemSum + (item.values[month] || 0), 0);
      return sum + parentValue + itemsTotal;
    }, 0);
  }

  getAllExpensesMonthTotal(month: string): number {
    return this.expenseCategories.reduce((sum, category) => {
      const parentValue = category.values[month] || 0;
      const itemsTotal = category.items.reduce((itemSum, item) => 
        itemSum + (item.values[month] || 0), 0);
      return sum + parentValue + itemsTotal;
    }, 0);
  }

  getProfitLoss(month: string): number {
    const income = this.getAllCategoriesMonthTotal(month);
    const expenses = this.getAllExpensesMonthTotal(month);
    return income - expenses;
  }
}

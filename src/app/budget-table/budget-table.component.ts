import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeCategory, ExpenseCategory, BaseCategory, BaseItem } from './models/budget.types';

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

  @ViewChildren('newIncomeItemInput') newIncomeItemInputs!: QueryList<ElementRef>;
  @ViewChildren('newExpenseItemInput') newExpenseItemInputs!: QueryList<ElementRef>;
  @ViewChildren('newIncomeCategoryInput') newIncomeCategoryInputs!: QueryList<ElementRef>;
  @ViewChildren('newExpenseCategoryInput') newExpenseCategoryInputs!: QueryList<ElementRef>;

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

  private createMonthValues(): { [key: string]: number } {
    const monthValues: { [key: string]: number } = {};
    this.months.forEach(month => monthValues[month] = 0);
    return monthValues;
  }

  private createCategory(name: string, isDefault: boolean = false): BaseCategory {
    return {
      name,
      isDefault,
      values: this.createMonthValues(),
      items: []
    };
  }

  private createItem(name: string): BaseItem {
    return {
      name,
      values: this.createMonthValues()
    };
  }

  private initializeCategories(defaultCategories: { name: string, items: string[] }[]): BaseCategory[] {
    return defaultCategories.map(cat => ({
      ...this.createCategory(cat.name, true),
      items: cat.items.map(itemName => this.createItem(itemName))
    }));
  }

  private initializeIncome() {
    const defaultCategories = [
      {
        name: 'General Income',
        items: ['Sales', 'Commissions']
      },
      {
        name: 'Other Income',
        items: ['Training', 'Consulting']
      }
    ];
    this.incomeCategories = this.initializeCategories(defaultCategories);
  }

  private initializeExpenses() {
    const defaultCategories = [
      {
        name: 'Fixed Expenses',
        items: ['Rent', 'Utilities']
      },
      {
        name: 'Variable Expenses',
        items: ['Marketing', 'Office Supplies']
      }
    ];
    this.expenseCategories = this.initializeCategories(defaultCategories);
  }

  private addNewItem(categories: BaseCategory[], categoryIndex: number, inputs: QueryList<ElementRef>) {
    const category = categories[categoryIndex];
    category.items.push(this.createItem('New Child Category'));

    const previousItemsCount = categories
      .slice(0, categoryIndex + 1)
      .reduce((sum, cat) => sum + cat.items.length, 0);

    setTimeout(() => {
      const inputArray = inputs.toArray();
      const lastInput = inputArray[previousItemsCount - 1];
      if (lastInput) {
        lastInput.nativeElement.focus();
      }
    });
  }

  addNewCategory(categoryIndex: number) {
    this.addNewItem(this.incomeCategories, categoryIndex, this.newIncomeItemInputs);
  }

  addNewExpenseItem(categoryIndex: number) {
    this.addNewItem(this.expenseCategories, categoryIndex, this.newExpenseItemInputs);
  }

  private addNewParentCategoryBase(categories: BaseCategory[], inputs: QueryList<ElementRef>) {
    categories.push(this.createCategory('New Parent Category'));
    setTimeout(() => {
      const lastInput = inputs.last;
      if (lastInput) {
        lastInput.nativeElement.focus();
      }
    });
  }

  addNewParentCategory() {
    this.addNewParentCategoryBase(this.incomeCategories, this.newIncomeCategoryInputs);
  }

  addNewExpenseCategory() {
    this.addNewParentCategoryBase(this.expenseCategories, this.newExpenseCategoryInputs);
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

  handleEnterKey(isExpense: boolean = false) {
    if (isExpense) {
      this.addNewExpenseCategory();
    } else {
      this.addNewParentCategory();
    }
  }
}

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SwitchOption } from '../../models/switch-option.model';
import { StorageService } from '../../services/storage.service';
import { Store } from '../../models/store.model';

interface GradedOption extends SwitchOption {
  dynamicGrades: {
    model: number;
    condition: number;
    unlock: number;
    storage: number;
    store: number;
    warranty: number;
    cashPayment: number;
    installmentWithInterest: number;
    installmentWithoutInterest: number;
    price: number;
  };
  globalScore: number;
}

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel matrix-container">
      <div class="header-actions">
        <h2>Matriz de Decisão</h2>
        <p class="subtitle">A pontuação global é calculada multiplicando a nota atribuída automaticamente pelo peso que você definir abaixo.</p>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr class="weights-row">
              <th>Pesos (1 a 10)</th>
              <th><input type="number" [(ngModel)]="weights.model" min="1" max="10" (change)="recalculate()" title="Peso para Modelo"></th>
              <th><input type="number" [(ngModel)]="weights.condition" min="1" max="10" (change)="recalculate()" title="Peso para Condição"></th>
              <th><input type="number" [(ngModel)]="weights.unlock" min="1" max="10" (change)="recalculate()" title="Peso para Desbloqueio"></th>
              <th><input type="number" [(ngModel)]="weights.storage" min="1" max="10" (change)="recalculate()" title="Peso para Armazenamento"></th>
              <th><input type="number" [(ngModel)]="weights.store" min="1" max="10" (change)="recalculate()" title="Peso para Loja"></th>
              <th><input type="number" [(ngModel)]="weights.warranty" min="1" max="10" (change)="recalculate()" title="Peso para Garantia"></th>
              <th><input type="number" [(ngModel)]="weights.cashPayment" min="1" max="10" (change)="recalculate()" title="Peso para Preço à Vista"></th>
              <th><input type="number" [(ngModel)]="weights.installmentWithInterest" min="1" max="10" (change)="recalculate()" title="Peso para Parcela com Juros"></th>
              <th><input type="number" [(ngModel)]="weights.installmentWithoutInterest" min="1" max="10" (change)="recalculate()" title="Peso para Parcela sem Juros"></th>
              <th><input type="number" [(ngModel)]="weights.price" min="1" max="10" (change)="recalculate()" title="Peso Geral para Preço"></th>
              <th>-</th>
              <th>-</th>
            </tr>
            <tr>
              <th>Opção</th>
              <th>Modelo</th>
              <th>Condição</th>
              <th>Desbloqueio</th>
              <th>Armaz.</th>
              <th>Loja</th>
              <th>Garantia</th>
              <th>Pag. à vista</th>
              <th>Parc. c/ juros</th>
              <th>Parc. s/ juros</th>
              <th>Preço Geral</th>
              <th>Pontuação Final</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let opt of gradedOptions; let i = index" [class.top-choice]="i === 0 && gradedOptions.length > 1">
              <td class="option-name">
                {{ opt.name }}
                <span class="rank-badge" *ngIf="i === 0 && gradedOptions.length > 1">🏆 #1 Recomendado</span>
                <div class="details">
                  {{ opt.model }} • {{ opt.condition }} • {{ opt.storageGb }}GB • {{ opt.isUnlocked ? 'Desbloq.' : 'Bloq.' }}
                  <br>Loja: {{ getStoreName(opt.store) }} • Pgto: {{ opt.paymentMethod }} • Gar: {{ opt.warrantyDays ? opt.warrantyDays + ' dias' : 'S/G' }}
                  <span *ngIf="opt.cashPrice"><br>À vista: {{ opt.cashPrice | currency:'BRL' }}</span>
                  <span *ngIf="opt.discountPercentage"><br>Desconto à vista: <strong style="color:var(--success-color)">{{ opt.discountPercentage | number:'1.1-2' }}%</strong></span>
                </div>
              </td>
              <td [class]="getGradeClass(opt.dynamicGrades.model)">{{ opt.dynamicGrades.model | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.condition)">{{ opt.dynamicGrades.condition | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.unlock)">{{ opt.dynamicGrades.unlock | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.storage)">{{ opt.dynamicGrades.storage | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.store)">{{ opt.dynamicGrades.store | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.warranty)">{{ opt.dynamicGrades.warranty | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.cashPayment)">{{ opt.dynamicGrades.cashPayment | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.installmentWithInterest)">{{ opt.dynamicGrades.installmentWithInterest | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.installmentWithoutInterest)">{{ opt.dynamicGrades.installmentWithoutInterest | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.price)">{{ opt.dynamicGrades.price | number:'1.0-1' }}</td>
              <td class="global-score">{{ opt.globalScore | number:'1.0-0' }}</td>
              <td>
                <button class="btn-delete" (click)="onDelete(opt.id)">Excluir</button>
              </td>
            </tr>
            <tr *ngIf="gradedOptions.length === 0">
              <td colspan="13" class="empty-state">Nenhuma opção adicionada ainda. Use o formulário acima.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .matrix-container {
      padding: 24px;
      overflow: hidden;
    }

    .header-actions {
      margin-bottom: 24px;
      
      h2 { color: var(--primary-color); }
      .subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
    }

    .table-responsive {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      min-width: 1100px;
    }

    th, td {
      padding: 12px;
      border: 1px solid var(--glass-border);
    }

    th {
      background: rgba(0, 0, 0, 0.3);
      color: var(--accent-color);
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .weights-row th {
      background: rgba(230, 0, 18, 0.1);
      
      input {
        width: 46px;
        background: transparent;
        border: 1px solid var(--glass-border);
        color: white;
        text-align: center;
        border-radius: 4px;
        padding: 4px;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }

    td {
      font-size: 0.95rem;
      transition: background 0.2s ease;
      
      &.option-name {
        text-align: left;
        font-weight: 600;
        min-width: 250px;
        position: relative;
        
        .details {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 400;
          margin-top: 4px;
        }
      }

      &.global-score {
        font-weight: bold;
        color: var(--primary-color);
        font-size: 1.1rem;
        background: rgba(230, 0, 18, 0.05);
      }
    }

    .rank-badge {
      display: inline-block;
      margin-left: 8px;
      background: rgba(255, 215, 0, 0.2);
      color: #ffd700;
      border: 1px solid #ffd700;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 12px;
      vertical-align: middle;
    }

    tr.top-choice td {
      background: rgba(255, 215, 0, 0.05);
    }
    
    tbody tr:hover td {
      background: rgba(255, 255, 255, 0.05);
    }

    /* Grade Colors */
    .grade-high { color: var(--success-color); font-weight: bold; }
    .grade-med { color: var(--warning-color); }
    .grade-low { color: var(--danger-color); }

    .btn-delete {
      background: transparent;
      border: 1px solid var(--danger-color);
      color: var(--danger-color);
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--danger-color);
        color: white;
      }
    }

    .empty-state {
      padding: 40px !important;
      color: var(--text-secondary);
      font-style: italic;
    }
  `]
})
export class MatrixComponent implements OnInit, OnChanges {
  @Input() options: SwitchOption[] = [];
  @Output() delete = new EventEmitter<string>();
  
  stores: Store[] = [];
  gradedOptions: GradedOption[] = [];

  // Default Weights
  weights = {
    model: 5, condition: 8, unlock: 9, storage: 6, store: 7, warranty: 5,
    cashPayment: 10, installmentWithInterest: 5, installmentWithoutInterest: 8, price: 5
  };

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.stores = this.storageService.getStores();
    this.recalculate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.stores = this.storageService.getStores(); // reload stores just in case
      this.recalculate();
    }
  }

  recalculate() {
    if (!this.options || this.options.length === 0) {
      this.gradedOptions = [];
      return;
    }

    // Prepare min/max for relative grading of prices
    const cashPrices = this.options.map(o => Number(o.cashPrice)).filter(p => !isNaN(p) && p > 0);
    const intPrices = this.options.map(o => Number(o.installmentWithInterestPrice)).filter(p => !isNaN(p) && p > 0);
    const noIntPrices = this.options.map(o => Number(o.installmentWithoutInterestPrice)).filter(p => !isNaN(p) && p > 0);
    const warranties = this.options.map(o => Number(o.warrantyDays)).filter(p => !isNaN(p) && p >= 0);

    const minCash = cashPrices.length ? Math.min(...cashPrices) : 0;
    const maxCash = cashPrices.length ? Math.max(...cashPrices) : 0;
    
    const minInt = intPrices.length ? Math.min(...intPrices) : 0;
    const maxInt = intPrices.length ? Math.max(...intPrices) : 0;

    const minNoInt = noIntPrices.length ? Math.min(...noIntPrices) : 0;
    const maxNoInt = noIntPrices.length ? Math.max(...noIntPrices) : 0;

    const minWarr = warranties.length ? Math.min(...warranties) : 0;
    const maxWarr = warranties.length ? Math.max(...warranties) : 0;

    // Calculate grades for each option
    this.gradedOptions = this.options.map(opt => {
      // Discrete Grades
      let modelGrade = 5;
      if (opt.model === 'OLED') modelGrade = 10;
      else if (opt.model === 'V2') modelGrade = 8;
      else if (opt.model === 'V1') modelGrade = 6;
      else if (opt.model === 'LITE') modelGrade = 5;

      let conditionGrade = 5;
      if (opt.condition === 'NOVO') conditionGrade = 10;
      else if (opt.condition === 'SEMINOVO') conditionGrade = 7;
      else if (opt.condition === 'USADO') conditionGrade = 4;

      let storageGrade = 5;
      if (opt.storageGb === 512) storageGrade = 10;
      else if (opt.storageGb === 256) storageGrade = 8;
      else if (opt.storageGb === 128) storageGrade = 6;
      else if (opt.storageGb === 64) storageGrade = 4;
      else if (opt.storageGb === 32) storageGrade = 2;

      const unlockGrade = opt.isUnlocked ? 10 : 2;

      let storeGrade = 5;
      const storeObj = this.stores.find(s => s.id === opt.store);
      if (storeObj) {
        storeGrade = storeObj.isReliable ? 10 : 2;
      }

      // Relative Price Grades (Lower is better)
      const calcRelativePriceGrade = (val: any, min: number, max: number) => {
        const p = Number(val);
        if (isNaN(p) || p <= 0) return 0; // Invalid or missing
        if (max === min) return 10; // Only one price, gets 10
        return 10 - ((p - min) / (max - min)) * 9; // Range 1 to 10
      };

      // Relative Warranty Grade (Higher is better)
      const calcRelativeWarrantyGrade = (val: any, min: number, max: number) => {
        const p = Number(val);
        if (isNaN(p) || p < 0) return 0; // Invalid or missing
        if (max === min) return 10; // Only one warranty length, gets 10
        return 1 + ((p - min) / (max - min)) * 9; // Range 1 to 10
      };

      const cashGrade = calcRelativePriceGrade(opt.cashPrice, minCash, maxCash);
      const intGrade = calcRelativePriceGrade(opt.installmentWithInterestPrice, minInt, maxInt);
      const noIntGrade = calcRelativePriceGrade(opt.installmentWithoutInterestPrice, minNoInt, maxNoInt);
      
      const warrantyGrade = calcRelativeWarrantyGrade(opt.warrantyDays, minWarr, maxWarr);

      // General Price Grade = average of available price grades
      let sumP = 0, countP = 0;
      if (cashGrade > 0) { sumP += cashGrade; countP++; }
      if (intGrade > 0) { sumP += intGrade; countP++; }
      if (noIntGrade > 0) { sumP += noIntGrade; countP++; }
      const genPriceGrade = countP > 0 ? sumP / countP : 0;

      const dynamicGrades = {
        model: modelGrade,
        condition: conditionGrade,
        unlock: unlockGrade,
        storage: storageGrade,
        store: storeGrade,
        warranty: warrantyGrade,
        cashPayment: cashGrade,
        installmentWithInterest: intGrade,
        installmentWithoutInterest: noIntGrade,
        price: genPriceGrade
      };

      // Calculate Global Score
      const score = (
        (dynamicGrades.model * (this.weights.model || 0)) +
        (dynamicGrades.condition * (this.weights.condition || 0)) +
        (dynamicGrades.unlock * (this.weights.unlock || 0)) +
        (dynamicGrades.storage * (this.weights.storage || 0)) +
        (dynamicGrades.store * (this.weights.store || 0)) +
        (dynamicGrades.warranty * (this.weights.warranty || 0)) +
        (dynamicGrades.cashPayment * (this.weights.cashPayment || 0)) +
        (dynamicGrades.installmentWithInterest * (this.weights.installmentWithInterest || 0)) +
        (dynamicGrades.installmentWithoutInterest * (this.weights.installmentWithoutInterest || 0)) +
        (dynamicGrades.price * (this.weights.price || 0))
      );

      return {
        ...opt,
        dynamicGrades,
        globalScore: score
      };
    });

    // Sort by globalScore descending
    this.gradedOptions.sort((a, b) => b.globalScore - a.globalScore);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }

  getGradeClass(grade: number): string {
    if (grade >= 8) return 'grade-high';
    if (grade >= 5) return 'grade-med';
    if (grade > 0) return 'grade-low';
    return ''; // For 0 (N/A)
  }

  getStoreName(storeId: string): string {
    const store = this.stores.find(s => s.id === storeId);
    return store ? store.name : storeId;
  }
}

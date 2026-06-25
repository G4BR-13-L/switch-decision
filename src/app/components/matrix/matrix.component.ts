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
    paymentFacility: number;
    price: number;
  };
  globalScore: number;
  expanded?: boolean; // For mobile accordian
}

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-panel matrix-container">
      <div class="header-actions">
        <h2>Ranking e Matriz</h2>
        <p class="subtitle">Ajuste os pesos (1 a 10) usando os controles abaixo.</p>
      </div>

      <!-- DESKTOP VIEW (TABLE) -->
      <div class="desktop-view table-responsive">
        <table>
          <thead>
            <tr class="weights-row">
              <th>Pesos:</th>
              
              <th>
                <div class="stepper" title="Peso Modelo">
                  <button (click)="adjustWeight('model', -1)">-</button>
                  <span>{{ weights.model }}</span>
                  <button (click)="adjustWeight('model', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Condição">
                  <button (click)="adjustWeight('condition', -1)">-</button>
                  <span>{{ weights.condition }}</span>
                  <button (click)="adjustWeight('condition', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Desbloqueio">
                  <button (click)="adjustWeight('unlock', -1)">-</button>
                  <span>{{ weights.unlock }}</span>
                  <button (click)="adjustWeight('unlock', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Armazenamento">
                  <button (click)="adjustWeight('storage', -1)">-</button>
                  <span>{{ weights.storage }}</span>
                  <button (click)="adjustWeight('storage', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Loja">
                  <button (click)="adjustWeight('store', -1)">-</button>
                  <span>{{ weights.store }}</span>
                  <button (click)="adjustWeight('store', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Garantia">
                  <button (click)="adjustWeight('warranty', -1)">-</button>
                  <span>{{ weights.warranty }}</span>
                  <button (click)="adjustWeight('warranty', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Pgto à Vista">
                  <button (click)="adjustWeight('cashPayment', -1)">-</button>
                  <span>{{ weights.cashPayment }}</span>
                  <button (click)="adjustWeight('cashPayment', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Parc. c/ Juros">
                  <button (click)="adjustWeight('installmentWithInterest', -1)">-</button>
                  <span>{{ weights.installmentWithInterest }}</span>
                  <button (click)="adjustWeight('installmentWithInterest', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Parc. s/ Juros">
                  <button (click)="adjustWeight('installmentWithoutInterest', -1)">-</button>
                  <span>{{ weights.installmentWithoutInterest }}</span>
                  <button (click)="adjustWeight('installmentWithoutInterest', 1)">+</button>
                </div>
              </th>
              <th>
                <div class="stepper" title="Peso Preço Geral">
                  <button (click)="adjustWeight('price', -1)">-</button>
                  <span>{{ weights.price }}</span>
                  <button (click)="adjustWeight('price', 1)">+</button>
                </div>
              </th>
              
              <th>
                <div class="stepper" title="Peso Facilidade de Pgto">
                  <button (click)="adjustWeight('paymentFacility', -1)">-</button>
                  <span>{{ weights.paymentFacility }}</span>
                  <button (click)="adjustWeight('paymentFacility', 1)">+</button>
                </div>
              </th>
              <th>-</th>
              <th>-</th>
            </tr>
            <tr>
              <th>Opção</th>
              <th>Modelo</th>
              <th>Condição</th>
              <th>Desbloq.</th>
              <th>Armaz.</th>
              <th>Loja</th>
              <th>Garantia</th>
              <th>Pg. vista</th>
              <th>Parc. c/ j</th>
              <th>Parc. s/ j</th>
              <th>Facilidade Pgto</th>
              <th>Preço Ger.</th>
              <th>Placar Final</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let opt of gradedOptions; let i = index" [class.top-choice]="i === 0 && gradedOptions.length > 1">
              <td class="option-name">
                {{ opt.name }}
                <span class="rank-badge" *ngIf="i === 0 && gradedOptions.length > 1">🏆 #1</span>
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
              <td [class]="getGradeClass(opt.dynamicGrades.paymentFacility)">{{ opt.dynamicGrades.paymentFacility | number:'1.0-1' }}</td>
              <td [class]="getGradeClass(opt.dynamicGrades.price)">{{ opt.dynamicGrades.price | number:'1.0-1' }}</td>
              <td class="global-score">{{ opt.globalScore | number:'1.0-0' }}</td>
              <td>
                <button class="btn-delete" (click)="onDelete(opt.id)">Excluir</button>
              </td>
            </tr>
            <tr *ngIf="gradedOptions.length === 0">
              <td colspan="13" class="empty-state">Nenhuma opção cadastrada. Adicione uma pelo wizard.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE VIEW (LIST OF CARDS) -->
      <div class="mobile-view">
        
        <div class="mobile-weights-card">
          <h3>Ajustar Pesos</h3>
          <div class="mobile-steppers-grid">
            <div class="stepper-item"><span>Mod</span> <div class="stepper"><button (click)="adjustWeight('model', -1)">-</button><span>{{ weights.model }}</span><button (click)="adjustWeight('model', 1)">+</button></div></div>
            <div class="stepper-item"><span>Cond</span> <div class="stepper"><button (click)="adjustWeight('condition', -1)">-</button><span>{{ weights.condition }}</span><button (click)="adjustWeight('condition', 1)">+</button></div></div>
            <div class="stepper-item"><span>Desbl</span> <div class="stepper"><button (click)="adjustWeight('unlock', -1)">-</button><span>{{ weights.unlock }}</span><button (click)="adjustWeight('unlock', 1)">+</button></div></div>
            <div class="stepper-item"><span>Armaz</span> <div class="stepper"><button (click)="adjustWeight('storage', -1)">-</button><span>{{ weights.storage }}</span><button (click)="adjustWeight('storage', 1)">+</button></div></div>
            <div class="stepper-item"><span>Loja</span> <div class="stepper"><button (click)="adjustWeight('store', -1)">-</button><span>{{ weights.store }}</span><button (click)="adjustWeight('store', 1)">+</button></div></div>
            <div class="stepper-item"><span>Gar</span> <div class="stepper"><button (click)="adjustWeight('warranty', -1)">-</button><span>{{ weights.warranty }}</span><button (click)="adjustWeight('warranty', 1)">+</button></div></div>
            <div class="stepper-item"><span>Vista</span> <div class="stepper"><button (click)="adjustWeight('cashPayment', -1)">-</button><span>{{ weights.cashPayment }}</span><button (click)="adjustWeight('cashPayment', 1)">+</button></div></div>
            <div class="stepper-item"><span>C/Jur</span> <div class="stepper"><button (click)="adjustWeight('installmentWithInterest', -1)">-</button><span>{{ weights.installmentWithInterest }}</span><button (click)="adjustWeight('installmentWithInterest', 1)">+</button></div></div>
            <div class="stepper-item"><span>S/Jur</span> <div class="stepper"><button (click)="adjustWeight('installmentWithoutInterest', -1)">-</button><span>{{ weights.installmentWithoutInterest }}</span><button (click)="adjustWeight('installmentWithoutInterest', 1)">+</button></div></div>
            <div class="stepper-item"><span>Fac.Pgto</span> <div class="stepper"><button (click)="adjustWeight('paymentFacility', -1)">-</button><span>{{ weights.paymentFacility }}</span><button (click)="adjustWeight('paymentFacility', 1)">+</button></div></div>
            <div class="stepper-item"><span>Pr.Ger</span> <div class="stepper"><button (click)="adjustWeight('price', -1)">-</button><span>{{ weights.price }}</span><button (click)="adjustWeight('price', 1)">+</button></div></div>
          </div>
        </div>

        <div *ngIf="gradedOptions.length === 0" class="empty-state">
          Nenhuma opção cadastrada ainda.
        </div>

        <div class="ranking-card" *ngFor="let opt of gradedOptions; let i = index" [class.expanded]="opt.expanded" [class.top-choice]="i === 0 && gradedOptions.length > 1" (click)="opt.expanded = !opt.expanded">
          
          <div class="card-header">
            <div class="card-rank">
              <span class="medal" *ngIf="i === 0 && gradedOptions.length > 1">🏆</span>
              <span class="num" *ngIf="i > 0 || gradedOptions.length <= 1">#{{ i + 1 }}</span>
            </div>
            <div class="card-title">
              <h3>{{ opt.name }}</h3>
              <p *ngIf="!opt.expanded" class="short-desc">
                {{ opt.cashPrice ? (opt.cashPrice | currency:'BRL') : (opt.installmentWithoutInterestPrice ? (opt.installmentWithoutInterestPrice | currency:'BRL') : 'Preço Indisponível') }}
              </p>
            </div>
            <div class="card-score">
              <span class="score-val">{{ opt.globalScore | number:'1.0-0' }}</span>
              <span class="score-label">pts</span>
            </div>
          </div>

          <div class="card-details" *ngIf="opt.expanded">
            <hr>
            <div class="detail-grid">
              <div class="detail-item"><span>Modelo:</span> <strong>{{ opt.model }}</strong></div>
              <div class="detail-item"><span>Condição:</span> <strong>{{ opt.condition }}</strong></div>
              <div class="detail-item"><span>Desbloqueio:</span> <strong>{{ opt.isUnlocked ? 'Sim' : 'Não' }}</strong></div>
              <div class="detail-item"><span>Armaz.:</span> <strong>{{ opt.storageGb }}GB</strong></div>
              <div class="detail-item"><span>Loja:</span> <strong>{{ getStoreName(opt.store) }}</strong></div>
              <div class="detail-item"><span>Garantia:</span> <strong>{{ opt.warrantyDays ? opt.warrantyDays + ' d' : 'S/G' }}</strong></div>
              <div class="detail-item"><span>À vista:</span> <strong>{{ opt.cashPrice ? (opt.cashPrice | currency:'BRL') : '-' }}</strong></div>
              <div class="detail-item"><span>Parc. c/ Juros:</span> <strong>{{ opt.installmentWithInterestPrice ? (opt.installmentWithInterestPrice | currency:'BRL') : '-' }}</strong></div>
              <div class="detail-item"><span>Parc. s/ Juros:</span> <strong>{{ opt.installmentWithoutInterestPrice ? (opt.installmentWithoutInterestPrice | currency:'BRL') : '-' }}</strong></div>
              <div class="detail-item"><span>Pgto Princ.:</span> <strong>{{ opt.paymentMethod }}</strong></div>
            </div>
            
            <div class="card-actions">
               <button class="btn-delete" (click)="onDelete(opt.id); $event.stopPropagation()">Excluir Opção</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .matrix-container {
      padding: 24px;
      overflow: hidden;
      
      @media (max-width: 900px) {
        padding: 16px;
      }
    }

    .header-actions {
      margin-bottom: 24px;
      
      h2 { color: var(--primary-color); font-size: 1.5rem; }
      .subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px; }
    }

    /* STEPPER CONTROLS */
    .stepper {
      display: inline-flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      
      button {
        background: transparent;
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        cursor: pointer;
        
        &:hover { background: rgba(230, 0, 18, 0.4); }
        &:active { background: rgba(230, 0, 18, 0.6); }
      }
      
      span {
        width: 24px;
        text-align: center;
        font-size: 0.9rem;
        color: var(--accent-color);
        font-weight: bold;
      }
    }

    /* DESKTOP TABLE VIEW */
    .desktop-view {
      display: block;
      overflow-x: auto;
    }
    
    .mobile-view {
      display: none;
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
      vertical-align: middle;
    }

    .weights-row th {
      background: rgba(230, 0, 18, 0.1);
      padding: 8px;
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

    tr.top-choice td { background: rgba(255, 215, 0, 0.05); }
    tbody tr:hover td { background: rgba(255, 255, 255, 0.05); }

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
      
      &:hover { background: var(--danger-color); color: white; }
    }

    .empty-state {
      padding: 40px !important;
      color: var(--text-secondary);
      font-style: italic;
      text-align: center;
    }

    /* MOBILE VIEW (< 900px) */
    @media (max-width: 900px) {
      .desktop-view { display: none; }
      .mobile-view { display: flex; flex-direction: column; gap: 16px; padding-bottom: 80px; }

      .mobile-weights-card {
        background: rgba(230, 0, 18, 0.05);
        border: 1px solid rgba(230, 0, 18, 0.2);
        border-radius: 12px;
        padding: 16px;
        
        h3 { color: var(--accent-color); font-size: 1rem; margin-bottom: 12px; }
      }

      .mobile-steppers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        
        .stepper-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      }

      .ranking-card {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: 0.2s ease;
        
        &.top-choice {
          border-color: #ffd700;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          padding: 16px;
          gap: 16px;
          
          .card-rank {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--text-secondary);
            
            .medal { font-size: 1.8rem; }
            .num { opacity: 0.5; }
          }
          
          .card-title {
            flex: 1;
            h3 { margin: 0; font-size: 1.1rem; color: white; }
            .short-desc { margin: 4px 0 0; font-size: 0.85rem; color: var(--accent-color); }
          }
          
          .card-score {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(230, 0, 18, 0.15);
            border-radius: 8px;
            padding: 8px 12px;
            
            .score-val { font-size: 1.4rem; font-weight: bold; color: var(--primary-color); line-height: 1; }
            .score-label { font-size: 0.65rem; color: var(--primary-color); text-transform: uppercase; margin-top: 2px; }
          }
        }

        .card-details {
          padding: 0 16px 16px;
          
          hr { border: none; border-top: 1px solid var(--glass-border); margin: 0 0 16px; }
          
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
            
            .detail-item {
              display: flex;
              flex-direction: column;
              font-size: 0.8rem;
              
              span { color: var(--text-secondary); margin-bottom: 2px; }
              strong { color: white; font-size: 0.9rem; }
            }
          }

          .card-actions {
            display: flex;
            justify-content: flex-end;
            
            .btn-delete {
              padding: 10px 16px;
              width: 100%;
            }
          }
        }
      }
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
    cashPayment: 10, installmentWithInterest: 5, installmentWithoutInterest: 8, price: 5,
    paymentFacility: 7
  };

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.stores = this.storageService.getStores();
    this.recalculate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.stores = this.storageService.getStores();
      this.recalculate();
    }
  }

  adjustWeight(key: keyof typeof this.weights, delta: number) {
    let newVal = this.weights[key] + delta;
    if (newVal > 10) newVal = 10;
    if (newVal < 1) newVal = 1;
    this.weights[key] = newVal;
    this.recalculate();
  }

  recalculate() {
    if (!this.options || this.options.length === 0) {
      this.gradedOptions = [];
      return;
    }

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

    // Preserve expanded state
    const expandedStates = new Map<string, boolean>();
    this.gradedOptions.forEach(o => {
      if (o.expanded) expandedStates.set(o.id, true);
    });

    this.gradedOptions = this.options.map(opt => {
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

      const calcRelativePriceGrade = (val: any, min: number, max: number) => {
        const p = Number(val);
        if (isNaN(p) || p <= 0) return 0;
        if (max === min) return 10;
        return 10 - ((p - min) / (max - min)) * 9;
      };

      const calcRelativeWarrantyGrade = (val: any, min: number, max: number) => {
        const p = Number(val);
        if (isNaN(p) || p < 0) return 0;
        if (max === min) return 10;
        return 1 + ((p - min) / (max - min)) * 9;
      };

      const cashGrade = calcRelativePriceGrade(opt.cashPrice, minCash, maxCash);
      const intGrade = calcRelativePriceGrade(opt.installmentWithInterestPrice, minInt, maxInt);
      const noIntGrade = calcRelativePriceGrade(opt.installmentWithoutInterestPrice, minNoInt, maxNoInt);
      
      const warrantyGrade = calcRelativeWarrantyGrade(opt.warrantyDays, minWarr, maxWarr);

      let sumP = 0, countP = 0;
      if (cashGrade > 0) { sumP += cashGrade; countP++; }
      if (intGrade > 0) { sumP += intGrade; countP++; }
      if (noIntGrade > 0) { sumP += noIntGrade; countP++; }
      const genPriceGrade = countP > 0 ? sumP / countP : 0;

      let facilityGrade = 2; // Nenhum parcelamento
      if (opt.hasInstallmentWithoutInterest) {
        facilityGrade = 10;
      } else if (opt.hasInstallmentWithInterest) {
        facilityGrade = 6;
      }

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
        paymentFacility: facilityGrade,
        price: genPriceGrade
      };

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
        (dynamicGrades.paymentFacility * (this.weights.paymentFacility || 0)) +
        (dynamicGrades.price * (this.weights.price || 0))
      );

      return {
        ...opt,
        dynamicGrades,
        globalScore: score,
        expanded: expandedStates.get(opt.id) || false
      };
    });

    this.gradedOptions.sort((a, b) => b.globalScore - a.globalScore);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }

  getGradeClass(grade: number): string {
    if (grade >= 8) return 'grade-high';
    if (grade >= 5) return 'grade-med';
    if (grade > 0) return 'grade-low';
    return '';
  }

  getStoreName(storeId: string): string {
    const store = this.stores.find(s => s.id === storeId);
    return store ? store.name : storeId;
  }
}

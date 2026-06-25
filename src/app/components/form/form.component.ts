import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SwitchOption } from '../../models/switch-option.model';
import { Store } from '../../models/store.model';
import { StorageService } from '../../services/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="glass-panel wizard-container">
      
      <!-- HEADER DO WIZARD -->
      <div class="wizard-header">
        <button class="btn-icon" (click)="goBack()" title="Voltar">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div class="progress-bar">
          <div class="progress-fill" [style.width]="(currentStep / totalSteps) * 100 + '%'"></div>
        </div>
        <span class="step-counter">Etapa {{ currentStep }} de {{ totalSteps }}</span>
        <button class="btn-icon" (click)="cancelWizard()" title="Cancelar">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- CORPO DO WIZARD -->
      <!-- Removemos form tag para evitar submits implicitos com a tecla Enter do mobile. Usamos div. -->
      <div [formGroup]="switchForm" class="wizard-form-body">
        
        <!-- Passo 1: Nome -->
        <div class="step-content animate-in" *ngIf="currentStep === 1">
          <h2>Como vamos chamar essa opção?</h2>
          <p class="step-desc">Dê um nome para identificar fácil depois.</p>
          <div class="form-group">
            <input type="text" formControlName="name" placeholder="Ex: OLED Novo - Loja X" autofocus (keydown.enter)="advanceIfValid('name')">
          </div>
          <button type="button" class="btn-primary" [disabled]="switchForm.get('name')?.invalid" (click)="nextStep()">Avançar</button>
        </div>

        <!-- Passo 2: Modelo -->
        <div class="step-content animate-in" *ngIf="currentStep === 2">
          <h2>Qual é o modelo?</h2>
          <div class="cards-grid">
            <div class="wizard-card" [class.active]="switchForm.get('model')?.value === 'OLED'" (click)="selectCard('model', 'OLED')">
              <h3>OLED</h3>
              <p>Tela superior</p>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('model')?.value === 'V2'" (click)="selectCard('model', 'V2')">
              <h3>V2</h3>
              <p>Bateria melhorada</p>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('model')?.value === 'V1'" (click)="selectCard('model', 'V1')">
              <h3>V1</h3>
              <p>Primeira versão</p>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('model')?.value === 'LITE'" (click)="selectCard('model', 'LITE')">
              <h3>LITE</h3>
              <p>Apenas portátil</p>
            </div>
          </div>
        </div>

        <!-- Passo 3: Condição -->
        <div class="step-content animate-in" *ngIf="currentStep === 3">
          <h2>Qual o estado de conservação?</h2>
          <div class="cards-grid">
            <div class="wizard-card" [class.active]="switchForm.get('condition')?.value === 'NOVO'" (click)="selectCard('condition', 'NOVO')">
              <h3>NOVO</h3>
              <p>Lacrado na caixa</p>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('condition')?.value === 'SEMINOVO'" (click)="selectCard('condition', 'SEMINOVO')">
              <h3>SEMINOVO</h3>
              <p>Pouco uso</p>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('condition')?.value === 'USADO'" (click)="selectCard('condition', 'USADO')">
              <h3>USADO</h3>
              <p>Com marcas de uso</p>
            </div>
          </div>
        </div>

        <!-- Passo 4: Desbloqueado -->
        <div class="step-content animate-in" *ngIf="currentStep === 4">
          <h2>Ele é desbloqueado?</h2>
          <div class="cards-grid">
            <div class="wizard-card" [class.active]="switchForm.get('isUnlocked')?.value === true" (click)="selectCard('isUnlocked', true)">
              <h3>Sim</h3>
              <p>Permite jogos grátis</p>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('isUnlocked')?.value === false" (click)="selectCard('isUnlocked', false)">
              <h3>Não</h3>
              <p>Original / Bloqueado</p>
            </div>
          </div>
        </div>

        <!-- Passo 5: Armazenamento -->
        <div class="step-content animate-in" *ngIf="currentStep === 5">
          <h2>Qual o tamanho do SD Card incluso?</h2>
          <div class="cards-grid">
            <div class="wizard-card" [class.active]="switchForm.get('storageGb')?.value === 512" (click)="selectCard('storageGb', 512)"><h3>512 GB</h3></div>
            <div class="wizard-card" [class.active]="switchForm.get('storageGb')?.value === 256" (click)="selectCard('storageGb', 256)"><h3>256 GB</h3></div>
            <div class="wizard-card" [class.active]="switchForm.get('storageGb')?.value === 128" (click)="selectCard('storageGb', 128)"><h3>128 GB</h3></div>
            <div class="wizard-card" [class.active]="switchForm.get('storageGb')?.value === 64" (click)="selectCard('storageGb', 64)"><h3>64 GB</h3></div>
            <div class="wizard-card" [class.active]="switchForm.get('storageGb')?.value === 32" (click)="selectCard('storageGb', 32)"><h3>32 GB</h3></div>
          </div>
        </div>

        <!-- Passo 6: Loja -->
        <div class="step-content animate-in" *ngIf="currentStep === 6">
          <h2>Onde você vai comprar?</h2>
          <div class="cards-grid store-grid">
            <div class="wizard-card" *ngFor="let s of stores" [class.active]="switchForm.get('store')?.value === s.id" (click)="selectCard('store', s.id)">
              <h3>{{ s.name }}</h3>
              <p *ngIf="s.isReliable" class="badge-reliable">✓ Confiável</p>
            </div>
            <div class="wizard-card new-store-card" (click)="openStoreModal()">
              <h3>+ Nova Loja</h3>
              <p>Cadastrar</p>
            </div>
          </div>
        </div>

        <!-- Passo 7: Garantia -->
        <div class="step-content animate-in" *ngIf="currentStep === 7">
          <h2>Tem garantia?</h2>
          <p class="step-desc">Informe em dias (ex: 90 para 3 meses, 365 para 1 ano). Se não tiver, deixe em branco.</p>
          <div class="form-group">
            <input type="number" inputmode="numeric" formControlName="warrantyDays" placeholder="0" (keydown.enter)="nextStep()">
          </div>
          <button type="button" class="btn-primary" (click)="nextStep()">Avançar</button>
        </div>

        <!-- Passo 8: Pagamento à Vista -->
        <div class="step-content animate-in" *ngIf="currentStep === 8">
          <h2>Preço à Vista</h2>
          <p class="step-desc">Qual o valor total para pagamento imediato? (Em R$)</p>
          <div class="form-group">
            <input type="number" inputmode="decimal" formControlName="cashPrice" placeholder="2000" (input)="calculateDiscount()" (keydown.enter)="nextStep()">
          </div>
          <button type="button" class="btn-primary" (click)="nextStep()">Avançar</button>
        </div>

        <!-- Passo 9: Parcelamento Com Juros -->
        <div class="step-content animate-in" *ngIf="currentStep === 9">
          <h2>Parcelamento com Juros</h2>
          <p class="step-desc">Preencha se houver essa opção. Caso contrário, apenas avance.</p>
          <div class="finance-group">
            <div class="form-group">
              <label>Quantidade de parcelas</label>
              <input type="number" inputmode="numeric" formControlName="qtyInstallmentsWithInterest" placeholder="12" (keydown.enter)="nextStep()">
            </div>
            <div class="form-group">
              <label>Valor da Parcela (R$)</label>
              <input type="number" inputmode="decimal" formControlName="installmentValueWithInterest" placeholder="183.33" (keydown.enter)="nextStep()">
            </div>
            <div class="form-group">
              <label>Total Final (R$)</label>
              <input type="number" inputmode="decimal" formControlName="installmentWithInterestPrice" placeholder="2200" (keydown.enter)="nextStep()">
            </div>
          </div>
          <button type="button" class="btn-primary" (click)="nextStep()">Avançar</button>
        </div>

        <!-- Passo 10: Parcelamento Sem Juros -->
        <div class="step-content animate-in" *ngIf="currentStep === 10">
          <h2>Parcelamento sem Juros</h2>
          <p class="step-desc">Se a loja dividir sem juros, coloque aqui.</p>
          <div class="finance-group">
            <div class="form-group">
              <label>Quantidade de parcelas</label>
              <input type="number" inputmode="numeric" formControlName="qtyInstallmentsWithoutInterest" placeholder="10" (keydown.enter)="nextStep()">
            </div>
            <div class="form-group">
              <label>Valor da Parcela (R$)</label>
              <input type="number" inputmode="decimal" formControlName="installmentValueWithoutInterest" placeholder="210.00" (input)="calculateDiscount()" (keydown.enter)="nextStep()">
            </div>
            <div class="form-group">
              <label>Total Final (R$)</label>
              <input type="number" inputmode="decimal" formControlName="installmentWithoutInterestPrice" placeholder="2100" (input)="calculateDiscount()" (keydown.enter)="nextStep()">
            </div>
          </div>
          
          <div *ngIf="showInstallmentWarning" class="alert-warning">
            <strong>Aviso:</strong> A quantidade de parcelas × valor não bate com o total informado. Verifique!
          </div>

          <button type="button" class="btn-primary" (click)="nextStep()">Avançar</button>
        </div>

        <!-- Passo 11: Método Principal de Pgto -->
        <div class="step-content animate-in" *ngIf="currentStep === 11">
          <h2>Como você pretende pagar?</h2>
          <p class="step-desc">Esta opção será usada como sua decisão principal na matriz.</p>
          <div class="cards-grid">
            <div class="wizard-card" [class.active]="switchForm.get('paymentMethod')?.value === 'PIX'" (click)="selectCard('paymentMethod', 'PIX', true)">
              <h3>PIX</h3>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('paymentMethod')?.value === 'CREDITO'" (click)="selectCard('paymentMethod', 'CREDITO', true)">
              <h3>Cartão de Crédito</h3>
            </div>
            <div class="wizard-card" [class.active]="switchForm.get('paymentMethod')?.value === 'BOLETO'" (click)="selectCard('paymentMethod', 'BOLETO', true)">
              <h3>Boleto</h3>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Store Modal -->
    <div class="modal-overlay" *ngIf="showStoreModal">
      <div class="modal-content glass-panel animate-in">
        <h3>Cadastrar Nova Loja</h3>
        <form [formGroup]="storeForm" (ngSubmit)="onStoreSubmit()">
          <div class="form-group">
            <label>Nome da Loja *</label>
            <input type="text" formControlName="name" placeholder="Ex: Stop Games">
          </div>
          <div class="form-group">
            <label>Confiável?</label>
            <select formControlName="isReliable">
              <option [ngValue]="true">Sim (Confiável)</option>
              <option [ngValue]="false">Não (Duvidosa)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <input type="text" formControlName="description">
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input type="text" inputmode="tel" formControlName="phone">
          </div>
          <div class="form-group">
            <label>Site</label>
            <input type="url" formControlName="site">
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="closeStoreModal()">Cancelar</button>
            <button type="submit" class="btn-primary" [disabled]="!storeForm.valid">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      
      /* Make it Full Screen on Mobile */
      @media (max-width: 768px) {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2000;
        background: #0f172a; /* Solid dark background to hide body */
        margin: 0;
        border-radius: 0;
        border: none;
        padding: 16px 16px 32px 16px;
        overflow-y: auto;
      }
    }

    .wizard-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      flex-shrink: 0;
      
      .btn-icon {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
      }
      
      .progress-bar {
        flex: 1;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }
      }
      
      .step-counter {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 600;
        min-width: 80px;
        text-align: right;
      }
    }
    
    .wizard-form-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .step-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-bottom: 16px;
      
      h2 {
        color: var(--primary-color);
        margin-bottom: 8px;
        font-size: 1.5rem;
      }
      
      .step-desc {
        color: var(--text-secondary);
        margin-bottom: 24px;
        font-size: 0.95rem;
      }

      .btn-primary {
        margin-top: auto;
        padding: 16px;
        font-size: 1.1rem;
        border-radius: 12px;
      }
    }

    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        font-size: 0.9rem;
        margin-bottom: 8px;
        color: var(--text-secondary);
      }
      
      input, select {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 16px;
        color: white;
        font-family: inherit;
        width: 100%;
        font-size: 1.1rem;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(230, 0, 18, 0.2);
        }
      }
    }

    .finance-group {
      background: rgba(255, 255, 255, 0.03);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      
      .form-group:last-child {
        margin-bottom: 0;
      }
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      
      @media (max-width: 400px) {
        grid-template-columns: 1fr;
      }
    }

    .wizard-card {
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 20px 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 100px;
      
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: white;
      }
      
      p {
        margin: 8px 0 0 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      &.active {
        background: rgba(230, 0, 18, 0.15);
        border-color: var(--primary-color);
        
        h3 {
          color: var(--primary-color);
        }
      }
      
      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        transform: translateY(-2px);
      }
    }

    .new-store-card {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      background: transparent;
      
      &:hover {
        border-color: var(--accent-color);
        h3 { color: var(--accent-color); }
      }
    }

    .badge-reliable {
      color: var(--success-color) !important;
      font-weight: bold;
    }

    .animate-in {
      animation: slideIn 0.3s ease-out forwards;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .alert-warning {
      background: rgba(255, 171, 0, 0.15);
      border-left: 4px solid var(--warning-color);
      color: #ffd166;
      padding: 12px 16px;
      margin-bottom: 24px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    /* Modal Styles Mobile-friendly */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      padding: 16px;
      box-sizing: border-box;
    }

    .modal-content {
      width: 100%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      
      h3 {
        color: var(--primary-color);
        margin-bottom: 20px;
      }

      .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        
        button {
          margin-top: 0;
          flex: 1;
        }
      }
    }
  `]
})
export class FormComponent implements OnInit {
  @Output() optionAdded = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  
  switchForm: FormGroup;
  
  stores: Store[] = [];
  showStoreModal = false;
  storeForm: FormGroup;
  discountPercentage: number | null = null;

  // Wizard state
  currentStep = 1;
  totalSteps = 11;

  constructor(private fb: FormBuilder, private storageService: StorageService) {
    this.switchForm = this.fb.group({
      name: ['', Validators.required],
      model: [null, Validators.required], // Starts empty!
      condition: [null, Validators.required],
      isUnlocked: [null, Validators.required],
      storageGb: [null, Validators.required],
      store: ['', Validators.required],
      cashPrice: [''],
      
      qtyInstallmentsWithInterest: [''],
      installmentValueWithInterest: [''],
      installmentWithInterestPrice: [''],
      
      qtyInstallmentsWithoutInterest: [''],
      installmentValueWithoutInterest: [''],
      installmentWithoutInterestPrice: [''],
      
      paymentMethod: [null, Validators.required],
      warrantyDays: ['']
    });

    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      isReliable: [true, Validators.required],
      description: [''],
      phone: [''],
      site: ['']
    });
  }

  ngOnInit() {
    this.loadStores();
    
    this.switchForm.valueChanges.subscribe(() => {
      this.calculateDiscount();
    });
  }

  loadStores() {
    this.stores = this.storageService.getStores();
  }

  // WIZARD NAVIGATION
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }
  
  advanceIfValid(controlName: string) {
    if (this.switchForm.get(controlName)?.valid) {
      this.nextStep();
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.cancelWizard();
    }
  }

  cancelWizard() {
    this.cancelled.emit();
  }

  selectCard(controlName: string, value: any, isFinalStep = false) {
    this.switchForm.get(controlName)?.setValue(value);
    
    setTimeout(() => {
      if (isFinalStep) {
        this.onSubmit();
      } else {
        this.nextStep();
      }
    }, 150);
  }

  get showInstallmentWarning(): boolean {
    const v = this.switchForm.value;
    const checkMismatch = (qty: number, val: number, total: number) => {
      if (qty && val && total) {
        return Math.abs((qty * val) - total) > 0.1;
      }
      return false;
    };
    return checkMismatch(v.qtyInstallmentsWithInterest, v.installmentValueWithInterest, v.installmentWithInterestPrice) || 
           checkMismatch(v.qtyInstallmentsWithoutInterest, v.installmentValueWithoutInterest, v.installmentWithoutInterestPrice);
  }

  calculateDiscount() {
    const cash = parseFloat(this.switchForm.value.cashPrice);
    const totalWithoutInterest = parseFloat(this.switchForm.value.installmentWithoutInterestPrice);
    
    if (!isNaN(cash) && !isNaN(totalWithoutInterest) && totalWithoutInterest > 0 && cash < totalWithoutInterest) {
      this.discountPercentage = 100 - ((cash / totalWithoutInterest) * 100);
    } else {
      this.discountPercentage = null;
    }
  }

  openStoreModal() {
    this.showStoreModal = true;
    this.storeForm.reset({ isReliable: true });
  }

  closeStoreModal() {
    this.showStoreModal = false;
  }

  onStoreSubmit() {
    if (this.storeForm.valid) {
      const newStore: Store = {
        id: uuidv4(),
        ...this.storeForm.value
      };
      this.storageService.saveStore(newStore);
      this.loadStores();
      // Select the new store and automatically proceed
      this.selectCard('store', newStore.id);
      this.closeStoreModal();
    }
  }

  onSubmit() {
    if (this.switchForm.valid) {
      const newOption: SwitchOption = {
        id: uuidv4(),
        discountPercentage: this.discountPercentage || undefined,
        ...this.switchForm.value
      };
      this.storageService.saveOption(newOption);
      this.switchForm.reset({
        model: null, condition: null, isUnlocked: null, storageGb: null, store: '', paymentMethod: null, warrantyDays: ''
      });
      this.currentStep = 1;
      this.discountPercentage = null;
      this.optionAdded.emit();
    }
  }
}

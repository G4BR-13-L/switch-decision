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
    <div class="glass-panel form-container">
      <h2>Adicionar Nova Opção</h2>
      <form [formGroup]="switchForm" (ngSubmit)="onSubmit()">
        
        <!-- SEÇÃO: DADOS BÁSICOS -->
        <div class="form-section">
          <h3 class="section-title">Dados Básicos</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome / Identificação
                <span class="info-icon" title="Nome para identificar essa opção na matriz. Ex: Switch OLED do fulano">?</span>
              </label>
              <input type="text" formControlName="name" placeholder="Ex: OLED Novo - Loja X">
            </div>
            
            <div class="form-group">
              <label>Modelo
                <span class="info-icon" title="A versão do console. OLED tem tela melhor, LITE é apenas portátil.">?</span>
              </label>
              <select formControlName="model">
                <option value="OLED">OLED</option>
                <option value="V2">V2</option>
                <option value="V1">V1</option>
                <option value="LITE">LITE</option>
              </select>
            </div>

            <div class="form-group">
              <label>Loja/Suporte
                <span class="info-icon" title="Onde você comprará. Pode adicionar novas clicando no botão +">?</span>
              </label>
              <div class="store-select-group">
                <select formControlName="store">
                  <option value="" disabled selected>Selecione uma loja</option>
                  <option *ngFor="let s of stores" [value]="s.id">{{ s.name }}</option>
                </select>
                <button type="button" class="btn-icon" (click)="openStoreModal()" title="Nova Loja">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- SEÇÃO: ESPECIFICAÇÕES -->
        <div class="form-section">
          <h3 class="section-title">Especificações do Aparelho</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Condição
                <span class="info-icon" title="Estado de conservação. Novo tem maior valor.">?</span>
              </label>
              <select formControlName="condition">
                <option value="NOVO">NOVO</option>
                <option value="SEMINOVO">SEMINOVO</option>
                <option value="USADO">USADO</option>
              </select>
            </div>

            <div class="form-group">
              <label>Desbloqueado?
                <span class="info-icon" title="Consoles desbloqueados permitem instalar jogos. Eles ganham mais pontos na matriz.">?</span>
              </label>
              <select formControlName="isUnlocked">
                <option [ngValue]="true">Sim (Desbloqueado)</option>
                <option [ngValue]="false">Não (Bloqueado)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Armazenamento
                <span class="info-icon" title="O espaço do cartão de memória incluso. 512GB e 256GB dão pontuações bem maiores.">?</span>
              </label>
              <select formControlName="storageGb">
                <option [ngValue]="512">512 GB</option>
                <option [ngValue]="256">256 GB</option>
                <option [ngValue]="128">128 GB</option>
                <option [ngValue]="64">64 GB</option>
                <option [ngValue]="32">32 GB</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Tempo de Garantia (Dias)
                <span class="info-icon" title="Quantos dias de garantia o vendedor oferece. Quanto mais dias, maior sua pontuação de garantia.">?</span>
              </label>
              <input type="number" formControlName="warrantyDays" placeholder="Ex: 90">
            </div>
          </div>
        </div>

        <!-- SEÇÃO: FINANCEIRO -->
        <div class="form-section">
          <h3 class="section-title">Financeiro e Pagamento</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Forma de Pagamento
                <span class="info-icon" title="O método que você pretende pagar este console específico.">?</span>
              </label>
              <select formControlName="paymentMethod">
                <option value="PIX">PIX</option>
                <option value="CREDITO">Cartão de Crédito</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>

            <div class="form-group">
              <label>Preço à Vista (R$)
                <span class="info-icon" title="O valor total se você pagar tudo de uma vez. Usado para calcular o desconto.">?</span>
              </label>
              <input type="number" formControlName="cashPrice" placeholder="2000" (input)="calculateDiscount()">
            </div>
          </div>
          
          <div class="installment-grid">
            <!-- Parcelado Com Juros -->
            <div class="installment-box">
              <h4>Parcelamento c/ Juros</h4>
              <div class="form-group">
                <label>Qtd. de Parcelas
                  <span class="info-icon" title="Em quantas vezes você dividiria o valor pagando COM juros.">?</span>
                </label>
                <input type="number" formControlName="qtyInstallmentsWithInterest" placeholder="12">
              </div>
              <div class="form-group">
                <label>Valor da Parcela (R$)
                  <span class="info-icon" title="O valor de cada uma das parcelas.">?</span>
                </label>
                <input type="number" formControlName="installmentValueWithInterest" placeholder="183.33">
              </div>
              <div class="form-group">
                <label>Total Final (R$)
                  <span class="info-icon" title="A soma das parcelas. Se o total não bater com (Qtd * Valor), avisaremos abaixo.">?</span>
                </label>
                <input type="number" formControlName="installmentWithInterestPrice" placeholder="2200">
              </div>
            </div>
            
            <!-- Parcelado Sem Juros -->
            <div class="installment-box">
              <h4>Parcelamento s/ Juros</h4>
              <div class="form-group">
                <label>Qtd. de Parcelas
                  <span class="info-icon" title="Em quantas vezes você dividiria o valor pagando SEM juros.">?</span>
                </label>
                <input type="number" formControlName="qtyInstallmentsWithoutInterest" placeholder="10">
              </div>
              <div class="form-group">
                <label>Valor da Parcela (R$)
                  <span class="info-icon" title="O valor de cada uma das parcelas.">?</span>
                </label>
                <input type="number" formControlName="installmentValueWithoutInterest" placeholder="210.00" (input)="calculateDiscount()">
              </div>
              <div class="form-group">
                <label>Total Final (R$)
                  <span class="info-icon" title="A soma final do plano sem juros. Usado para calcular se vale a pena o desconto à vista.">?</span>
                </label>
                <input type="number" formControlName="installmentWithoutInterestPrice" placeholder="2100" (input)="calculateDiscount()">
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="showInstallmentWarning" class="alert-warning">
          <strong>Aviso:</strong> A quantidade de parcelas multiplicada pelo valor da parcela não condiz com o valor total informado. Verifique os valores de parcelamento.
        </div>
        
        <div *ngIf="discountPercentage !== null && discountPercentage > 0" class="discount-badge">
          Desconto à vista: {{ discountPercentage | number:'1.1-2' }}%
        </div>

        <button type="submit" class="btn-primary" [disabled]="!switchForm.valid">Adicionar à Matriz</button>
      </form>
    </div>

    <!-- Store Modal -->
    <div class="modal-overlay" *ngIf="showStoreModal">
      <div class="modal-content glass-panel">
        <h3>Cadastrar Nova Loja</h3>
        <form [formGroup]="storeForm" (ngSubmit)="onStoreSubmit()">
          <div class="form-group">
            <label>Nome da Loja *
              <span class="info-icon" title="Obrigatório. Nome oficial ou apelido para identificar.">?</span>
            </label>
            <input type="text" formControlName="name" placeholder="Ex: Stop Games">
          </div>
          <div class="form-group">
            <label>Confiável?
              <span class="info-icon" title="Lojas confiáveis dão maior segurança e recebem mais pontos.">?</span>
            </label>
            <select formControlName="isReliable">
              <option [ngValue]="true">Sim (Confiável)</option>
              <option [ngValue]="false">Não (Duvidosa)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descrição</label>
            <input type="text" formControlName="description" placeholder="Vende novos e seminovos">
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input type="text" formControlName="phone" placeholder="(11) 99999-9999">
          </div>
          <div class="form-group">
            <label>Site</label>
            <input type="text" formControlName="site" placeholder="https://...">
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
    .form-container {
      padding: 24px;
      margin-bottom: 32px;
      position: relative;
    }
    
    h2 {
      margin-bottom: 24px;
      color: var(--primary-color);
    }

    .form-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 1.1rem;
      color: var(--accent-color);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .installment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
      
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .installment-box {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
      
      h4 {
        margin-bottom: 12px;
        color: #ddd;
        font-size: 0.95rem;
      }
      
      .form-group {
        margin-bottom: 12px;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      
      label {
        font-size: 0.85rem;
        margin-bottom: 6px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
      }

      .info-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 0.7rem;
        font-weight: bold;
        margin-left: 6px;
        cursor: help;
        position: relative;
        
        &:hover::after {
          content: attr(title);
          position: absolute;
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: pre-wrap;
          width: max-content;
          max-width: 200px;
          text-align: center;
          z-index: 10;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          pointer-events: none;
        }
        
        &:hover::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: #333 transparent transparent transparent;
          z-index: 10;
        }
      }

      input, select {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--glass-border);
        border-radius: 6px;
        padding: 10px;
        color: white;
        font-family: inherit;
        width: 100%;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(230, 0, 18, 0.2);
        }
      }
      
      select option {
        background: var(--bg-color);
        color: white;
      }
    }

    .store-select-group {
      display: flex;
      gap: 8px;
      
      select {
        flex: 1;
      }
      
      .btn-icon {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        width: 40px;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background: #ff1a2b;
        }
      }
    }

    .alert-warning {
      background: rgba(255, 171, 0, 0.15);
      border-left: 4px solid var(--warning-color);
      color: #ffd166;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .discount-badge {
      display: inline-block;
      background: rgba(6, 214, 160, 0.2);
      color: var(--success-color);
      border: 1px solid var(--success-color);
      padding: 8px 16px;
      border-radius: 20px;
      margin: 16px 0;
      font-weight: 600;
      font-size: 0.95rem;
    }

    button[type="submit"] {
      margin-top: 16px;
      width: 100%;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      width: 100%;
      max-width: 400px;
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
        }
      }
    }
  `]
})
export class FormComponent implements OnInit {
  @Output() optionAdded = new EventEmitter<void>();
  switchForm: FormGroup;
  
  stores: Store[] = [];
  showStoreModal = false;
  storeForm: FormGroup;
  discountPercentage: number | null = null;

  constructor(private fb: FormBuilder, private storageService: StorageService) {
    this.switchForm = this.fb.group({
      name: ['', Validators.required],
      model: ['OLED', Validators.required],
      condition: ['NOVO', Validators.required],
      isUnlocked: [true, Validators.required],
      storageGb: [128, Validators.required],
      store: ['', Validators.required],
      cashPrice: [''],
      
      qtyInstallmentsWithInterest: [''],
      installmentValueWithInterest: [''],
      installmentWithInterestPrice: [''],
      
      qtyInstallmentsWithoutInterest: [''],
      installmentValueWithoutInterest: [''],
      installmentWithoutInterestPrice: [''],
      
      paymentMethod: ['PIX'],
      warrantyDays: [''] // Numerico, medido em dias
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
    
    // Subscribe to form changes for validation
    this.switchForm.valueChanges.subscribe(() => {
      this.calculateDiscount();
    });
  }

  loadStores() {
    this.stores = this.storageService.getStores();
  }

  get showInstallmentWarning(): boolean {
    const v = this.switchForm.value;
    
    const checkMismatch = (qty: number, val: number, total: number) => {
      if (qty && val && total) {
        // allowing a small margin of error for rounding (e.g., 0.05)
        return Math.abs((qty * val) - total) > 0.1;
      }
      return false;
    };

    const hasInterestMismatch = checkMismatch(
      v.qtyInstallmentsWithInterest, 
      v.installmentValueWithInterest, 
      v.installmentWithInterestPrice
    );
    
    const noInterestMismatch = checkMismatch(
      v.qtyInstallmentsWithoutInterest, 
      v.installmentValueWithoutInterest, 
      v.installmentWithoutInterestPrice
    );

    return hasInterestMismatch || noInterestMismatch;
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
      this.switchForm.patchValue({ store: newStore.id });
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
        model: 'OLED',
        condition: 'NOVO',
        isUnlocked: true,
        storageGb: 128,
        store: '',
        paymentMethod: 'PIX',
        warrantyDays: ''
      });
      this.discountPercentage = null;
      this.optionAdded.emit();
    }
  }
}

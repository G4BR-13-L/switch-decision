import { Component, OnInit } from '@angular/core';
import { FormComponent } from './components/form/form.component';
import { MatrixComponent } from './components/matrix/matrix.component';
import { StorageService } from './services/storage.service';
import { SwitchOption } from './models/switch-option.model';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormComponent, MatrixComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  options: SwitchOption[] = [];
  showWizard: boolean = false;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    this.loadOptions();
  }

  loadOptions() {
    this.options = this.storageService.getOptions();
  }

  onOptionAdded() {
    this.showWizard = false;
    this.loadOptions();
  }

  toggleWizard() {
    this.showWizard = !this.showWizard;
  }

  onDeleteOption(id: string) {
    this.storageService.deleteOption(id);
    this.loadOptions();
  }

  exportCsv() {
    this.storageService.exportToCsvFile();
  }

  importCsv(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.storageService.importCsv(file).then(() => {
        this.loadOptions();
        alert('Dados importados com sucesso!');
      }).catch(err => {
        console.error(err);
        alert('Erro ao importar arquivo');
      });
    }
  }

  clearStorage() {
    if (confirm('Tem certeza que deseja apagar todos os dados?')) {
      this.storageService.clearAll();
      this.loadOptions();
    }
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracaoPage } from './administracao.page';

describe('AdministracaoPage', () => {
  let component: AdministracaoPage;
  let fixture: ComponentFixture<AdministracaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

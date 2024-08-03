import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryViewerComponent } from './category-viewer.component';

describe('CategoryViewerComponent', () => {
  let component: CategoryViewerComponent;
  let fixture: ComponentFixture<CategoryViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

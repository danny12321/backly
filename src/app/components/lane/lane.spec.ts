import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lane } from './lane';

describe('Lane', () => {
  let component: Lane;
  let fixture: ComponentFixture<Lane>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lane]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lane);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

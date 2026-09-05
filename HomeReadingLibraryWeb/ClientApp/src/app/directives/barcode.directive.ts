import { AfterViewInit, Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import JsBarcode from 'jsbarcode';

/**
 * Renders a Code39 barcode (as SVG bars) into the host <svg> element using JsBarcode.
 * Kept as a thin, isolated wrapper so barcode rendering can be reused (and later made
 * configurable) without duplicating JsBarcode setup across components.
 */
@Directive({
  standalone: false,
  selector: 'svg[appBarcode]'
})
export class BarcodeDirective implements AfterViewInit, OnChanges {
  @Input() appBarcode = '';

  constructor(private elementRef: ElementRef<SVGElement>) { }

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appBarcode'] && !changes['appBarcode'].isFirstChange()) {
      this.render();
    }
  }

  private render(): void {
    const value = this.appBarcode?.trim();
    if (!value) {
      return;
    }

    JsBarcode(this.elementRef.nativeElement, value, {
      format: 'CODE39',
      displayValue: false,
      margin: 0,
      height: 40
    });
  }
}

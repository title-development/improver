import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[cv-dropzone]'
})
export class DropZoneDirective {

  @Output() filesChange: EventEmitter<FileList> = new EventEmitter();

  @HostListener('dragover', ['$event'])
  onDragOver(event: any): void {
    this.preventEvent(event);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: any): void {
    this.preventEvent(event);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.filesChange.emit(files);
    }
  }

  private preventEvent(event: any): void {
    event.preventDefault();
    event.stopPropagation();
  }
}

import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Project } from '../../../../api/models/Project';

@Component({
  selector: 'project-preview',
  templateUrl: './project-preview.component.html',
  styleUrls: ['./project-preview.component.scss']
})
export class ProjectPreviewComponent {
  @Input() projectInfo: Project;
  constructor() {}
}

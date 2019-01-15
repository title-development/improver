import { NgModule } from "@angular/core";
import { FilterByPipe } from "./filter.pipe";
import { ToClassNamePipe } from "./to-class-name.pipe";
import { StatusToString } from "./status-to-string.pipe";
import { CutArrayLengthPipe } from "./cut-array-length.pipe";
import { ForJsonPipe } from "./for-json.pipe";
import { TimeAgoPipe } from "./time-ago-pipe";
import { CamelCaseHumanPipe } from "./camelcase-to-human.pipe";
import { AddHtmlPipe } from './add-html.pipe';

@NgModule({
  imports: [],
  declarations: [
    FilterByPipe,
    ToClassNamePipe,
    StatusToString,
    TimeAgoPipe,
    CutArrayLengthPipe,
    ForJsonPipe,
    CamelCaseHumanPipe,
    AddHtmlPipe
  ],
  exports: [
    FilterByPipe,
    ToClassNamePipe,
    StatusToString,
    TimeAgoPipe,
    CutArrayLengthPipe,
    ForJsonPipe,
    CamelCaseHumanPipe,
    AddHtmlPipe
  ]
})

export class PipesModule { }


import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {PokemonExtended} from "../../../core/models/pokemon";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardTitleGroup} from "@angular/material/card";
import {STAT_MAP, TYPE_MAP} from "../../../core/constants/pokemon";
import {DecimalPipe, NgTemplateOutlet, SlicePipe, TitleCasePipe} from "@angular/common";
import {ReplacePipe} from "../../pipes/replace.pipe";
import {TagComponent} from "../tag/tag.component";
import {COMMA_REG_EXP, DEFAULT_PATH} from "../../../core/constants/app";
import {RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: "app-card",
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardTitleGroup,
    TitleCasePipe,
    SlicePipe,
    ReplacePipe,
    DecimalPipe,
    TagComponent,
    NgTemplateOutlet,
    RouterLink,
    MatIcon,
  ],
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() pokemon?: PokemonExtended;
  @Input() link?: string;

  protected readonly STAT_MAP = STAT_MAP;
  protected readonly TYPE_MAP = TYPE_MAP;
  protected readonly COMMA_REG_EXP = COMMA_REG_EXP;
  protected readonly DEFAULT_PATH = DEFAULT_PATH;
}

import {ChangeDetectionStrategy, Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {ListComponent} from "./features/list/list.component";
import {LoadingComponent} from "./core/components/loading/loading.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, ListComponent, LoadingComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
}

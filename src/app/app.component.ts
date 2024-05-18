import {ChangeDetectionStrategy, Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {LoadingComponent} from "./core/components/loading/loading.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
}

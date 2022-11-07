import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'myOgito';


  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.key === 'F11'){
      console.log("hit f11")
      document.getElementById("app-content-container").focus()
      document.getElementById("app-content-container").requestFullscreen()
      event.stopPropagation()
    }
  }

}

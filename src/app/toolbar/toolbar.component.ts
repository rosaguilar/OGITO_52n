import { Component, OnInit } from '@angular/core';
import {Subscription} from 'rxjs';
import {OpenLayersService} from '../open-layers.service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
//import {Indicator, IndicatorAnimations} from '../indicator';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
 // animations: IndicatorAnimations
})
export class ToolbarComponent implements OnInit {
  x = 0;
  y = 0;
  startX = 0;
  startY = 0;
  subscriptionExistingProject: Subscription;
  existingProject = true;

  onPanStart(event: any): void {
    this.startX = this.x;
    this.startY = this.y;
  }
  onPan(event: any): void {
    event.preventDefault();
    this.x = this.startX + event.deltaX;
    this.y = this.startY + event.deltaY;
  }
  zoomHome(){
    alert("add the code ZoomHome");
  }
  layerEditingChange(){  //change name --> edit mode
    alert("add the code Start editing");
  }
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private openLayersService: OpenLayersService) {

    iconRegistry.addSvgIcon(
      'layerScratch',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/baseline-layers-new-24px.svg')
    );
  }
  createScratchLayer(){
    /**
     * #TODO  send a subscription? ...
     */
  }

  ngOnInit(): void {
    this.subscriptionExistingProject = this.openLayersService.existingProject$.subscribe(
      (data: any) => this.existingProject = true,
      (error) => {
        alert('error retrieving existing project');
        console.log(error);
      });
  }

}
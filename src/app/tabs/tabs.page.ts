import { Component } from '@angular/core';
import {Router,Event,NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage  {
  public notificationCount = 0;
  public currentUrl: string;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
            console.log('loading finished', event);
            this.currentUrl = event.url.split('/').join('-')
        }
    });
  }

}

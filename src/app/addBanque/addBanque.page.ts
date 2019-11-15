import { Component } from '@angular/core';

@Component({
  templateUrl: 'addBanque.page.html',
  styleUrls: ['addBanque.page.scss']
})
export class addBanquePage {

  constructor() {

    console.log("test");
  }
  openBanque(code:string){
    sessionStorage.setItem("Code", code);
    
  }

}

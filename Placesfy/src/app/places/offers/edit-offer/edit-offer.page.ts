import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../places.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

  form: FormGroup;
  place: Place;
  placeId: string;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private route:ActivatedRoute,
    private navCrtl: NavController, 
    private placesService: PlacesService, 
    private router: Router, 
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has("placeId")) {
        this.navCrtl.navigateBack("/places/tabs/offers");
        return;
      }
      this.placeId = paramMap.get("placeId");

      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(paramMap.get("placeId")).subscribe(place =>  {
        this.place = place
        this.createForm(); 
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create({
          header: "An error ocurred!",
          message: "Place could not be fetched, Please try again later",
          buttons: [{text: "Okay", handler: () => {
            this.router.navigate(["/places/tabs/offers"]);
          }}]
        }).then(alertEl => alertEl.present());
      });
    })
  }

  createForm() {
    this.form = new FormGroup({
      newTitle: new FormControl(this.place.title, {
        updateOn: "blur",
        validators: [Validators.required, Validators.maxLength(50), Validators.minLength(1)]
      }),
      newDescription: new FormControl(this.place.description,{
        updateOn: "blur",
        validators: [Validators.required, Validators.maxLength(180), Validators.minLength(1)]
      })
    })
  }

  onEditOffer() {
    if(!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: "Updated place",
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updatePlace(this.place.id, this.form.get("newTitle").value, this.form.get("newDescription").value).subscribe( () => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      });

    })

  }

  ngOnDestroy() {
    if(this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
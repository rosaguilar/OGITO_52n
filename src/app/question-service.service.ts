import { Injectable } from '@angular/core';
import {AppConfiguration} from './app-configuration';
import { DropdownQuestion } from './dropdown-question';
import { QuestionBase } from './question-base';
import { TextboxQuestion } from './textbox-question';
import { CheckBoxQuestion } from './check-box-question';
import { SliderQuestion } from './slider-question';
import {of, Subject} from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
 questions = {};
  private showEditFormSource = new Subject<boolean>();
  showEditForm$ = this.showEditFormSource.asObservable();

  updateShowEditForm(showForm: boolean){
    this.showEditFormSource.next(showForm);
  }
 setLayerQuestions(layerName: string, qgisFieldList: any) {
    /**
     * forms the question from a list of fields;
     */
    // action plan layer treated in a different way
    if (layerName.toLowerCase() === AppConfiguration.actionPlanLayerName){
      return (this.setLayerQuestionsActionPlanNoise(layerName.toLowerCase(), qgisFieldList));
    }

  let order = 0;
  let layerQuestions: QuestionBase<any>[]=[];
  let question = null;
  let orderInLayer = false;
  // check if there is an specific order
  if (typeof(AppConfiguration.fieldsOrder[layerName.toLowerCase()]) !== 'undefined'){
     orderInLayer = true;
   }

  qgisFieldList.forEach(attr => {
   if (!(attr.name === 'id' || attr.name === 'fid' || attr.name === 'picfilepath' || attr.name === 'linkqrfile')){
     order = order + 1;
    let label = (attr.comment === '') ? (attr.name) : (attr.comment);
    const required = false;
    switch (attr.type) {
      case 'bool': {
        question = new CheckBoxQuestion({
          key: attr.name,
          label,
          value: 'true',  
          required,
          order: orderInLayer ? this.findOrder(layerName, attr.name) : order,
          type: 'checkbox'
        });
        break;
      }
      case 'QString': {
        question = new TextboxQuestion({
          key: attr.name,
          label,
          value: '',
          required,
          order: orderInLayer ? this.findOrder(layerName, attr.name) : order,
        });
        break;
      }
      case 'int': {
        question = new SliderQuestion({
          key: attr.name,
          label,
          value: 0,
          required,
          order: orderInLayer ? this.findOrder(layerName, attr.name) : order,
          min: this.findMinRange(attr.name),
          max: this.findMaxRange(attr.name),
        });
        break;
      }
      case 'double': {
        // Noise intensity must be int in the table
        question = new TextboxQuestion ({
          key: attr.name,
          label,
          value: '',
          required,
          order: orderInLayer ? this.findOrder(layerName, attr.name) : order,
        });
        break;
      }
    }
 layerQuestions.push(question);
   }
  });
  return layerQuestions;
 }

  setLayerQuestionsActionPlanNoise(layerName: string, qgisFieldList: any) {
    /**
     * forms the question from a list of fields;
     */
    // action plan layer treated in a different way
    let order = 0;
    let layerQuestions: QuestionBase<any>[]=[];
    let question = null;
    let orderInLayer = false;
    // check if there is an specific order
    if (typeof(AppConfiguration.fieldsOrder[layerName]) !== 'undefined'){
      orderInLayer = true;
    }
    qgisFieldList.forEach(attr => {
      if (!(attr.name === 'id' || attr.name === 'fid' || attr.name === 'picfilepath' || attr.name === 'linkqrfile')){
        order = order + 1;
        const label = (attr.comment === '') ? (attr.name) : (attr.comment);
        const required = true;
        // only boolean fields, those are the measures
        if (attr.type === 'bool') {
            question = new CheckBoxQuestion({
              key: attr.name,
              label,
              required:false,
              order: orderInLayer ? this.findOrder(layerName, attr.name) : order,
              type: 'checkbox'
            });
            layerQuestions.push(question);
        }
        if (attr.type === 'QString') {
          question = new TextboxQuestion({
            key: attr.name,
            label,
            value: '',  // if checked then it will get the true value
            required: false,
            order: orderInLayer ? this.findOrder(layerName, attr.name) : order,
          });
          layerQuestions.push(question);
        }
      }
    });
    return layerQuestions;
  }
  findOrder(layerName: string, attrName: any){
    layerName = layerName.toLowerCase(); // ensure lower case
    let order = 0;
    if (typeof (AppConfiguration.fieldsOrder[layerName]) !== 'undefined'){
     if (typeof(AppConfiguration.fieldsOrder[layerName][attrName]) !== 'undefined'){
         return(AppConfiguration.fieldsOrder[layerName][attrName]);
       }
    }
    return null;
  }

  findMinRange(attrName: any){
  let min = AppConfiguration.range.min;
  if (typeof (AppConfiguration.ranges[attrName]) !== 'undefined') {
      min = AppConfiguration.ranges[attrName].min;
  }
  return min;
  }

  findMaxRange(attrName: any){
    let max = AppConfiguration.range.max;
    if (typeof (AppConfiguration.ranges[attrName])!== 'undefined') {
      max = AppConfiguration.ranges[attrName].max;
    }
    return max;
  }

  setSketchQuestions(sketchName: string, fields: any) {
    // set the questions for a new Sketch layer
    // by default details a varchar field
    const questions = this.setLayerQuestions(sketchName, fields);
    this.questions[sketchName] = questions;
  }

  setQuestions(layerGroups){
    /**
     * builds all the questions for all the layers
     *
     */
    layerGroups.forEach( group =>{
      group.layers.forEach(layer =>{
        if (layer.wfs) {
         const questions = this.setLayerQuestions(layer.layerName, layer.fields);
         this.questions[layer.layerName] = questions; // no estoy segura de esto, es un dic...
        }
      });
    });
    }

  getQuestions(layerName: any){
    return (this.questions[layerName].sort((a, b) => a.order - b.order));
  }
  toFormGroup(questions: QuestionBase<string>[] ) {
    const group: any = {};
   questions.forEach(question => {
    if (question.controlType === 'checkbox') {
        group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
          : new FormControl( false); // workaround...
        return;
      }
    group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
        : new FormControl(question.value || '');
    });
    return new FormGroup(group);
  }


}

import { ChangeState, Distributed, GetState, SetState } from "madoi-client";
import type { vec3 } from "../util";

export interface InfoObject {
  name: string;
  selected: boolean;
  url: string;
  position: vec3;
  scale: vec3;
}

export class InfoObjectsModel{
  private objs: InfoObject[] = [];

  constructor(objs: InfoObject[]){
    this.objs = objs;
  }

  @Distributed()
  @ChangeState()
  addObject(name: string){
    if (!name || this.objs.some(object => object.name === name)) return;
    this.objs.push({name, selected: false, url: '', position: [-2, 1, 2], scale: [1, 1, 1]});
    this.objs = [...this.objs];
  }

  @Distributed()
  @ChangeState()
  removeObject(name: string){
    this.objs.filter(object => object.name !== name)
    this.objs = [...this.objs];
  }

  @Distributed()
  @ChangeState()
  setObjectPosition(objectName: string, position: vec3){
    this.objs = this.objs.map(obj => {
      if(obj.name === objectName){
        console.log(`${objectName} updated`, position);
        return ({...obj, position});
      } else{
        return obj;
      }
//      obj.name === objectName ? {...obj, position} : obj);
    });
    console.log(`${objectName} updated`, position, this.objs);
  }

  @Distributed()
  @ChangeState()
  setObjectScale(objectName: string, scale: vec3){
    this.objs = this.objs.map(obj => 
      obj.name === objectName ? {...obj, scale} : obj);
  }

  @Distributed()
  @ChangeState()
  setObjectSelected(objectName: string, selected: boolean){
    this.objs = this.objs.map(obj => 
      obj.name === objectName ? {...obj, selected} : obj);
  }

  @Distributed()
  @ChangeState()
  setObjectUrl(objectName: string, url: string){
    this.objs = this.objs.map(obj => 
      obj.name === objectName ? {...obj, url} : obj);
  }

  size(){
    return this.objs.length;
  }

  @GetState()
  getObjects(){
    return this.objs;
  }

  @SetState()
  setObjects(objs: InfoObject[]){
    this.objs = [...objs];
  }

  findObject(name: string){
    return this.objs.find(object => object.name === name);
  }
}

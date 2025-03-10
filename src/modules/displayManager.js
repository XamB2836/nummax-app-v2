export default class DisplayManager {
  constructor() {
    this.dimension = [0, 0];
  }

  setWidth(value) {
    this.dimension[0] = value;
  }

  update() {
    console.log(this);
  }

  getWidth() {
    return this.dimension[0];
  }
}
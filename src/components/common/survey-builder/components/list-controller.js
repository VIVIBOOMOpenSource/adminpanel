const helpers = {
  set(array, index, element) {
    return [...array.slice(0, index), element, ...array.slice(index + 1)];
  },
  insert(array, index, element) {
    return [...array.slice(0, index), element, ...array.slice(index)];
  },
  remove(array, index) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  },
  move(array, fromIndex, toIndex) {
    return this.insert(this.remove(array, fromIndex), toIndex, array[fromIndex]);
  },
};

export default class ListController {
  constructor(array, callback) {
    this.array = array;
    this.callback = callback;
  }

  set(index, newContent) {
    this.callback(helpers.set(this.array, index, newContent));
  }

  add(newContent) {
    this.callback([...this.array, newContent]);
  }

  remove(index) {
    this.callback(helpers.remove(this.array, index));
  }

  moveUp(index) {
    const newIndex = index === 0 ? index : index - 1;
    this.callback(helpers.move(this.array, index, newIndex));
  }

  moveDown(index) {
    const newIndex = index === this.array.length - 1 ? index : index + 1;
    this.callback(helpers.move(this.array, index, newIndex));
  }
}
